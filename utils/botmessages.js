const BOTURL = process.env.BOT_WEBAPP

export const startInfoResp = `
<strong>Open Mind</strong>
Open the app by pressing the "Open Mind" button below or just <a href='${
  BOTURL || 'https://t.me/mindechobot/web'
}'>click here</a>.

<strong>Resources</strong>
Our library - @mindecholib

Here we will post all of additional information about effective learning techniques and information for self-development

<strong>Need some help?</strong>
/help - will show you information and all of the commands for this bot
`

const helptCommandResp = `/guide - usefull instructions of how to use this bot`
