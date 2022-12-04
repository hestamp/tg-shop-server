import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
const token = process.env.TGBOT_TOKEN
const webAppUrl = process.env.REACT_APP

const bot = new TelegramBot(token, { polling: true })

const app = express()

app.use(express.json())
app.use(cors())

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Кнопка зявиться нижче, заповніть форму', {
      reply_markup: {
        keyboard: [
          [{ text: 'Заповнити форму', web_app: { url: webAppUrl + '/form' } }],
        ],
      },
    })

    await bot.sendMessage(chatId, 'Зробити замовлення', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Зробити замовлення', web_app: { url: webAppUrl } }],
        ],
      },
    })
  }
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg.web_app_data.data)
      console.log(data)
      bot.sendMessage(
        chatId,
        `Дані отримані. Ваше замовлення буде надіслано за адресою ${data?.city}, ${data?.street} and ${data?.poshta}`
      )
    } catch (error) {}
  }
})

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

const PORT = 8000

app.listen(PORT, () => console.log('server is running on PORT ' + PORT))
