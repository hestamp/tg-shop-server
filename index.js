import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import compression from 'compression'
import cors from 'cors'
import { authLimiter, globalLimiter } from './utils/limiter.js'
import {
  getUser,
  getUserTgMessage,
  userNewParamAdd,
} from './controllers/UserController.js'
import { handleValidationErrors, checkAuth } from './utils/index.js'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js' // Import UTC plugin if needed
import timezone from 'dayjs/plugin/timezone.js' // Import timezone plugin if needed

// Extend dayjs with UTC and timezone plugins if you need timezone support
dayjs.extend(utc)
dayjs.extend(timezone)

config()

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

app.set('trust proxy', 1)
// app.use(compression({ filter: shouldCompress }))

app.use(express.json())
app.use(cors())

app.use(globalLimiter)

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

//create echos of user
app.patch('/api/auth/echos/create', newEchoValidator, checkAuth, createEcho)

//edit existing echo
app.patch('/api/auth/echos/edit', editEchoValidator, checkAuth, editEcho)

app.patch('/api/auth/echos/remove', removeEchoValidator, checkAuth, removeEcho)

//achives
app.patch(
  '/api/auth/achive/update',
  updateAchiveValidator,
  checkAuth,
  updateAchiveStat
)

app.patch('/api/auth/goal', goalValidator, checkAuth, goalUpdate)

app.patch('/api/admin/newparam', userNewParamAdd)

const userId = 6908036343 // From your provided data

const message = `⚡️ Bot is running or reload, and this is message i send you. Time ${Date.now()} ` // The message you want to send

bot
  .sendMessage(userId, message)
  .then((response) => console.log('Message sent'))
  .catch((error) => console.error(error))

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const msgText = msg.text
  const userName = msg.chat.first_name

  const windowMs = 60000 // 60 seconds
  const max = 30 // Max 30 messages per chatId

  if (isRateLimited(chatId, windowMs, max)) {
    await bot.sendMessage(chatId, 'Too many requests, please try again later')
    return
  }

  let usermsg = ''

  if (msgText == '/help') {
    usermsg = 'dont panic, we will help you'
  } else if (msgText == '/start') {
    usermsg = `Hey, ${userName}. This is demo version of MindEcho. To start - click on \"Test My App\" button 
    \n Note: This is Development version so there might be some bugs. Dont be scared, they cannot bite you.`
  } else {
    usermsg = 'other scenario'
  }

  bot.sendMessage(chatId, usermsg)

  const savingresults = await getUserTgMessage(msg)

  console.log(savingresults?.message, `TGID: ${msg.from.id}`)

  if (savingresults?.error) {
    console.log(savingresults.error)
  }
})

const runNotificationsCheckAndSend = async () => {
  // Get the current minute
  const currentMinute = new Date().getMinutes()
  console.log(`Notifications check and send run at ${currentMinute} minute`)

  await sendNotificationsToUsers({ bot: bot })

  // Schedule the next check after 1 minute
  setTimeout(runNotificationsCheckAndSend, 60000) // 1 minutes * 60 seconds * 1000 milliseconds
}

runNotificationsCheckAndSend()

const defaultPort = 8000

// Determine the running environment
const isProduction = process.env.NODE_ENV === 'production'
const port = isProduction ? process.env.PORT : defaultPort
const host = isProduction ? '0.0.0.0' : 'localhost'

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`)
})
