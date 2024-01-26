import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import compression from 'compression'
import cors from 'cors'
import { authLimiter, globalLimiter } from './utils/limiter.js'
import { checkUser } from './controllers/UserController.js'
config()

import UserModel from './models/User.js'

const rateLimitData = {}

function isRateLimited(chatId, windowMs, max) {
  const now = Date.now()
  if (!rateLimitData[chatId]) {
    rateLimitData[chatId] = { count: 1, windowStart: now }
    return false
  }

  const userData = rateLimitData[chatId]
  if (userData.windowStart + windowMs < now) {
    // Reset count after window has passed
    userData.count = 1
    userData.windowStart = now
    return false
  }

  if (userData.count >= max) {
    // User is rate limited
    return true
  }

  // Increment count and allow request
  userData.count += 1
  return false
}

const token = process.env.TGBOT_TOKEN
const MONGODB_URI = process.env.MONGODB_URI
const WEBAPP_URL = process.env.WEBAPP_URL

// const webAppUrl = process.env.REACT_APP
const webAppUrl = WEBAPP_URL

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }

  // fallback to standard filter function
  return compression.filter(req, res)
}

mongoose.set('strictQuery', true)

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

// Import the user model and validation function

// const bot = new TelegramBot(token, { polling: true })

const app = express()
app.use(compression({ filter: shouldCompress }))

app.use(express.json())
app.use(cors())

app.use(globalLimiter)

app.use('/api/auth/login', authLimiter)

app.post('/api/auth/login', authLimiter)

async function processAndStoreTelegramData(initData) {
  // Extract necessary information from initData
  // Find the user by some unique identifier (e.g., authId)
  // Update the user with the new Telegram data
  const user = await UserModel.findOne({ authId: initData.user.id })
  if (user) {
    console.log(user)
    user.telegramData = initData
    await user.save()
    return user
  } else {
    // Handle the case if the user does not exist
    // You might want to create a new user or handle differently
  }
}

app.post('/userdata', async (req, res) => {
  const { initData } = req.body
  console.log('user data recieved from client')
  console.log(initData)
  // Extract necessary data from initData
  // Use your function to process and store this data in your MongoDB database
  try {
    const updatedUser = await processAndStoreTelegramData(initData)
    res.json({ success: true, updatedUser })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// bot
//   .setChatMenuButton(chatId, menuButton)
//   .then(() => {
//     console.log('Menu button set successfully')
//   })
//   .catch((error) => {
//     console.error('Failed to set menu button:', error)
//   })

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id

//   const windowMs = 60 * 1000 // 60 seconds
//   const max = 10 // Max 10 messages per window

//   if (isRateLimited(chatId, windowMs, max)) {
//     await bot.sendMessage(chatId, 'Too many requests, please try again later')
//     return
//   }

//   console.log(chatId)
//   // const newuser = await checkUser(chatId)
//   // console.log(`acc registered`)
//   // console.log(newuser)
//   // This will log the chat ID to your console

//   bot.sendMessage(
//     chatId,
//     `Your chat ID is: ${chatId}, and you send to this bot  messages`
//   )
// })

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id
//   const text = msg.text

//   if (text === '/start') {
//     await bot.sendMessage(chatId, 'Кнопка зявиться нижче, заповніть форму', {
//       reply_markup: {
//         keyboard: [[{ text: 'Заповнити форму', web_app: { url: webAppUrl } }]],
//       },
//     })

//     // await bot.sendMessage(chatId, 'Зробити замовлення', {
//     //   reply_markup: {
//     //     inline_keyboard: [
//     //       [{ text: 'Зробити замовлення', web_app: { url: webAppUrl } }],
//     //     ],
//     //   },
//     // })
//   }

//   if (msg?.web_app_data?.data) {
//     try {
//       const data = JSON.parse(msg.web_app_data.data)
//       console.log(data)

//       bot.sendMessage(
//         chatId,
//         `Дані отримані. Ваше замовлення буде надіслано за адресою ${data?.city}, ${data?.street} and ${data?.poshta}`
//       )
//     } catch (error) {}
//   }
// })

app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успішна покупка',
      input_message_content: {
        message_text: `Ваше замовлення буде колись працювати`,
      },
    })

    return res.status(200).json({})
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Невдала спроба покупки',
      input_message_content: {
        message_text: 'Замовлення не сформовано. Спробуйте ще раз',
      },
    })

    return res.status(500).json({})
  }
})

const defaultPort = 8000

// Determine the running environment
const isProduction = process.env.NODE_ENV === 'production'
const port = isProduction ? process.env.PORT : defaultPort
const host = isProduction ? '0.0.0.0' : 'localhost'

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`)
})
