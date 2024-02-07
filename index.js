import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import compression from 'compression'
import cors from 'cors'
import { authLimiter, globalLimiter } from './utils/limiter.js'
import { getUser } from './controllers/UserController.js'
import { handleValidationErrors, checkAuth } from './utils/index.js'
config()

import UserModel from './models/Usermodel.js'
import {
  createEcho,
  editEcho,
  goalUpdate,
  removeEcho,
  settingUpdate,
} from './controllers/UserPatch.js'
import {
  editEchoValidator,
  goalValidator,
  newEchoValidator,
  removeEchoValidator,
  settingEditValidator,
} from './utils/validator.js'

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

// function shouldCompress(req, res) {
//   if (req.headers['x-no-compression']) {
//     // don't compress responses with this request header
//     return false
//   }

//   // fallback to standard filter function
//   return compression.filter(req, res)
// }

mongoose.set('strictQuery', true)

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

// Import the user model and validation function

const bot = new TelegramBot(token, { polling: true })

const app = express()

// app.set('trust proxy', false)
// app.use(compression({ filter: shouldCompress }))

async function processAndStoreTelegramData({ unsafe }) {
  // Extract necessary information from initData
  // Find the user by some unique identifier (e.g., authId)
  // Update the user with the new Telegram data
  const user = await UserModel.findOne({ authId: unsafe.user.id })
  if (!user) {
    console.log(user)
    user.telegramData = unsafe
    await user.save()
    return user
  } else {
    // Handle the case if the user does not exist
    // You might want to create a new user or handle differently
  }
}

app.use(express.json())
app.use(cors())

app.use(globalLimiter)

app.use('/api/auth/userdata', authLimiter)
app.post('/api/auth/userdata', getUser)

//update settings name
app.patch('/api/auth/setting/', settingEditValidator, checkAuth, settingUpdate)

//create echos of user
app.patch('/api/auth/echos/create', newEchoValidator, checkAuth, createEcho)

//edit existing echo
app.patch('/api/auth/echos/edit', editEchoValidator, checkAuth, editEcho)

app.patch('/api/auth/echos/remove', removeEchoValidator, checkAuth, removeEcho)

app.patch('/api/auth/goal', goalValidator, checkAuth, goalUpdate)

const userId = 969788508 // From your provided data
const message = `Bot is running or reload, and this is message i send you. Time ${Date.now()}` // The message you want to send

bot
  .sendMessage(userId, message)
  .then((response) => console.log('Message sent'))
  .catch((error) => console.error(error))

// bot
//   .setChatMenuButton(chatId, menuButton)
//   .then(() => {
//     console.log('Menu button set successfully')
//   })
//   .catch((error) => {
//     console.error('Failed to set menu button:', error)
//   })

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const userName = msg.chat.first_name
  const chaTime = msg.date
  console.log(chaTime)
  const nowdate = new Date()

  const timestampInSeconds = Math.floor(nowdate.getTime() / 1000)

  console.log(timestampInSeconds)

  const windowMs = 60 * 1000 // 60 seconds
  const max = 1 // Max 10 messages per window

  if (isRateLimited(chatId, windowMs, max)) {
    await bot.sendMessage(chatId, 'Too many requests, please try again later')
    return
  }

  // const newuser = await checkUser(chatId)
  // console.log(`acc registered`)
  // console.log(newuser)
  // This will log the chat ID to your console

  bot.sendMessage(
    chatId,
    `Hey, ${userName}. This is demo version of MindEcho. To start - click on \"Open My Test\" button 
  \n Note: Development version still runs localy, so this bot might not be active sometimes.`
  )
})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  console.log(msg)
  const text = msg.text

  // if (text === '/start') {
  //   await bot.sendMessage(chatId, 'Кнопка зявиться нижче, заповніть форму', {
  //     reply_markup: {
  //       keyboard: [[{ text: 'Заповнити форму', web_app: { url: webAppUrl } }]],
  //     },
  //   })

  //   await bot.sendMessage(chatId, 'Зробити замовлення', {
  //     reply_markup: {
  //       inline_keyboard: [
  //         [{ text: 'Зробити замовлення', web_app: { url: webAppUrl } }],
  //       ],
  //     },
  //   })
  // }

  // if (msg?.web_app_data?.data) {
  //   try {
  //     const data = JSON.parse(msg.web_app_data.data)
  //     console.log(data)

  //     bot.sendMessage(
  //       chatId,
  //       `Дані отримані. Ваше замовлення буде надіслано за адресою ${data?.city}, ${data?.street} and ${data?.poshta}`
  //     )
  //   } catch (error) {}
  // }
})

// app.post('/web-data', async (req, res) => {
//   const { queryId, products, totalPrice } = req.body

//   try {
//     await bot.answerWebAppQuery(queryId, {
//       type: 'article',
//       id: queryId,
//       title: 'Успішна покупка',
//       input_message_content: {
//         message_text: `Ваше замовлення буде колись працювати`,
//       },
//     })

//     return res.status(200).json({})
//   } catch (error) {
//     await bot.answerWebAppQuery(queryId, {
//       type: 'article',
//       id: queryId,
//       title: 'Невдала спроба покупки',
//       input_message_content: {
//         message_text: 'Замовлення не сформовано. Спробуйте ще раз',
//       },
//     })

//     return res.status(500).json({})
//   }
// })

const defaultPort = 8000

// Determine the running environment
const isProduction = process.env.NODE_ENV === 'production'
const port = isProduction ? process.env.PORT : defaultPort
const host = isProduction ? '0.0.0.0' : 'localhost'

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`)
})
