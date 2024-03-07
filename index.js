import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import mongoose from 'mongoose'

import compression from 'compression'
import cors from 'cors'
import cron from 'node-cron'

// DOTENV RUN CONFIG
import { config } from 'dotenv'
config()

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js' // Import UTC plugin if needed
import timezone from 'dayjs/plugin/timezone.js'
dayjs.extend(utc)
dayjs.extend(timezone)

import { authLimiter, globalLimiter } from './utils/limiter.js'
import {
  getUser,
  getUserTgMessage,
  userNewParamAdd,
} from './controllers/UserController.js'
import { checkAuth } from './utils/index.js'

import {
  createEcho,
  editEcho,
  goalUpdate,
  notiftimeUpdate,
  removeEcho,
  settingUpdate,
  updateAchiveStat,
} from './controllers/UserPatch.js'
import {
  editEchoValidator,
  goalValidator,
  newEchoValidator,
  notifTimeValidator,
  removeEchoValidator,
  settingEditValidator,
  updateAchiveValidator,
} from './utils/validator.js'
import { sendNotificationsToUsers } from './utils/notifications.js'
import { postStat } from './controllers/Statistics.js'
import { startInfoResp } from './utils/botmessages.js'

// Basic rate limitation for messages in TG bot

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

// Get params from ENV
const token = process.env.TGBOT_TOKEN
const MONGODB_URI = process.env.MONGODB_URI
const BOTURL = process.env.BOT_WEBAPP
const URLSLUG = 'https://t.me/mindechobot/web'

// Function for compression

// function shouldCompress(req, res) {
//   if (req.headers['x-no-compression']) {
//     // don't compress responses with this request header
//     return false
//   }

//   // fallback to standard filter function
//   return compression.filter(req, res)
// }

// Define of mongodb params and run it
mongoose.set('strictQuery', true)

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

// Define bot and express app
const bot = new TelegramBot(token, { polling: true })

const app = express()

app.set('trust proxy', 1)

// Compression if use server for providing frontend
// app.use(compression({ filter: shouldCompress }))

app.use(express.json())
app.use(cors())

app.use(globalLimiter)

// Getting user data
app.use('/api/auth/userdata', authLimiter)
app.post('/api/auth/userdata', getUser)

//update settings name
app.patch('/api/auth/setting/', settingEditValidator, checkAuth, settingUpdate)
app.patch(
  '/api/auth/setting/notiftime',
  notifTimeValidator,
  checkAuth,
  notiftimeUpdate
)

//CRUD for echoes
app.patch('/api/auth/echos/create', newEchoValidator, checkAuth, createEcho)

app.patch('/api/auth/echos/edit', editEchoValidator, checkAuth, editEcho)

app.patch('/api/auth/echos/remove', removeEchoValidator, checkAuth, removeEcho)

//Updating achieves
app.patch(
  '/api/auth/achive/update',
  updateAchiveValidator,
  checkAuth,
  updateAchiveStat
)

app.patch('/api/auth/goal', goalValidator, checkAuth, goalUpdate)

// Push some params to existing users
app.patch('/api/admin/newparam', userNewParamAdd)

///Admin TG notification about running of server
const userId = 6908036343 // From your provided data

const message = `⚡️ Bot is running or reload, and this is message i send you. Time ${Date.now()} \n New add \n \n New paragraph \n\n <strong>Bold text</strong>
<em>Italic text</em>
<a href="http://example.com">Clickable link</a>` // The message you want to send

const testGreet = `Bot is reload now `
bot
  .sendMessage(userId, testGreet, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  })
  .then((response) => console.log('Message sent'))
  .catch((error) => console.error(error))
///////////

//Message processing
// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id
//   const msgText = msg.text
//   const userName = msg.chat.first_name

//   const windowMs = 60000 // 60 seconds
//   const max = 30 // Max 30 messages per chatId

//   if (isRateLimited(chatId, windowMs, max)) {
//     await bot.sendMessage(chatId, 'Too many requests, please try again later')
//     return
//   }

//   let usermsg = ''

//   if (msgText == '/help') {
//     usermsg = 'dont panic, we will help you'
//   } else if (msgText == '/start') {
//     usermsg = `Hey, ${userName}. This is demo version of MindEcho. To start - click on \"Test My App\" button
//     \n Note: This is Development version so there might be some bugs. Dont be scared, they cannot bite you.`
//   } else {
//     usermsg = 'other scenario'
//   }

//   bot.sendMessage(chatId, usermsg)

//   const savingresults = await getUserTgMessage(msg)

//   console.log(savingresults?.message, `TGID: ${msg.from.id}`)

//   if (savingresults?.error) {
//     console.log(savingresults.error)
//   }
// })

// Commands i need - /start - basic info guide

// /help - message with list of basic commands and userguide

// /new text

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id

  const messageOptions = {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  const newMsg = startInfoResp

  bot.sendMessage(chatId, newMsg || 'Hello there!', messageOptions)
})

// // Command: /new
bot.onText(/\/new (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const resp = match[1]

  const message = ` You send ${resp} for this bot`

  bot.sendMessage(chatId, message)
})

// // Command: /custom
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id

  const messageOptions = {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  const newMsg = startInfoResp

  bot.sendMessage(chatId, newMsg || 'Hello there!', messageOptions)
})

// // Default handler for unmatched messages
bot.onText(/^(?!\/new|\/start|\/guide|\/help).*$/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(
    chatId,
    "I don't understand this. Try /help to access to all of the commands"
  )
})

// function rateLimitMiddleware(msg, next) {
//   const chatId = msg.chat.id

//   if (isRateLimited(chatId, windowMs, max)) {
//     bot.sendMessage(chatId, 'Too many requests, please try again later')
//     return
//   }

//   // Continue processing the message
//   next()
// }

/// Notification send to user for eachoes repetition
cron.schedule('0,30 * * * *', async () => {
  const currentDate = new Date()
  console.log(`Notifications check and send run at ${currentDate}`)

  await sendNotificationsToUsers({ bot: bot })
})

// Statistic update at midnight server time

const statUpdate = async () => {
  console.log('ding dong, here is new day and new stat run')
  await postStat('users', true)
  await postStat('visits', true)
  await postStat('messages', true)
  await postStat('echoes', true)
  await postStat('repetition', true)
  await postStat('completed', true)
}
cron.schedule('0 0 * * *', async () => {
  await statUpdate()
})

// Server running env
const defaultPort = 8000
// Determine the running environment
const isProduction = process.env.NODE_ENV === 'production'
const port = isProduction ? process.env.PORT : defaultPort
const host = isProduction ? '0.0.0.0' : 'localhost'

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`)
})
