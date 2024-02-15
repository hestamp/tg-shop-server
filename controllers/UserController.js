import UserModel from '../models/Usermodel.js'

function generateNumber(inputNumber) {
  const randomSuffix = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 10)
  ).join('')

  return parseInt(`${inputNumber}${randomSuffix}`, 10) || inputNumber
}

export const getUser = async (req, res) => {
  if (req.body.tgid) {
    try {
      const { tgid, tgdata, platform, timezone } = req.body

      const nowUnix = Date.now()

      const founduser = await UserModel.findOne({ tgid: tgid })
      if (!founduser) {
        const userId = generateNumber(nowUnix) || nowUnix

        const userForm = {}
        userForm.timezone = timezone || 'UTC'
        userForm.lastAppOpen = nowUnix
        userForm.regDate = nowUnix
        userForm.authId = userId
        userForm.platform = platform
        userForm.tgid = tgdata.user.id || nowUnix
        userForm.firstName = tgdata.user.first_name || ''
        userForm.lastName = tgdata.user.last_name || ''
        userForm.fullName = tgdata.user.first_name || ''
        userForm.lang = tgdata.user.language_code || 'en'
        userForm.telegramData = {
          authDate: tgdata.auth_date || '',
          hash: tgdata.hash || '',
        }

        const doc = new UserModel(userForm)

        const newuser = await doc.save()
        if (newuser) {
          const userfiles = newuser._doc

          const {
            telegramData,
            _id,
            lastAppOpen,
            createdAt,
            updatedAt,
            regDate,
            __v,
            ...userData
          } = newuser._doc

          res.json({
            user: userData,
          })
        } else {
          res.status(500).json({
            error: 500,
            message: 'User is not saved. Try again',
          })
        }
      } else if (founduser) {
        const userfoundfile = founduser._doc

        const updateFields = {
          lastAppOpen: nowUnix,
          timezone: timezone,
          platform: platform,
          telegramData: {
            authDate: tgdata.auth_date || '',
            hash: tgdata.hash || '',
          },
        }

        await UserModel.updateOne(
          {
            tgid: tgid,
          },
          updateFields
        )

        const {
          telegramData,
          _id,
          lastAppOpen,
          createdAt,
          updatedAt,
          goal,
          regDate,
          __v,
          ...userData
        } = founduser._doc

        res.json({
          user: userData,
        })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({
        message: 'Error, please reload page and try again',
        error: 500,
      })
    }
  } else {
    res.status(500).json({
      message: 'Error, please reload page and try again',
      error: 500,
    })
  }
}
export const getUserTgMessage = async (user) => {
  const localuserid = user.from.id || user.chat.id
  if (localuserid) {
    try {
      const nowUnix = Date.now()

      const founduser = await UserModel.findOne({ tgid: localuserid })
      if (!founduser) {
        const userId = generateNumber(nowUnix) || nowUnix

        const userForm = {}
        userForm.timezone = 'UTC'
        userForm.lastAppOpen = 0
        userForm.regDate = nowUnix
        userForm.authId = userId
        userForm.platform = 'unknown'
        userForm.tgid = localuserid
        userForm.firstName = user.chat.first_name || `user${localuserid}`
        userForm.lastName = ''
        userForm.fullName = user.chat.first_name || `user${localuserid}`
        userForm.lang = user.from.language_code || 'en'
        userForm.telegramData = {
          authDate: '',
          hash: '',
        }

        const doc = new UserModel(userForm)

        const newuser = await doc.save()
        if (newuser) {
          console.log('new user saved')
          return {
            success: true,
            message: 'New user was saved!',
            error: null,
          }
        } else {
          console.log('User was not saved')
          return {
            success: false,
            message: 'New user was not saved!',
            error: null,
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Some error while creating user from message',
        error: error,
      }
    }
  } else {
    return {
      success: false,
      message: 'Some user launch bot without user credentials',
      error: null,
    }
  }
}

export const userNewParamAdd = async (req, res) => {
  try {
    const updateResult = await UserModel.updateMany(
      {}, // An empty filter object matches all documents

      {
        $set: {
          achive: [
            {
              id: 101,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
            {
              id: 102,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
            {
              id: 103,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
            {
              id: 104,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
            {
              id: 105,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
            {
              id: 106,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
            {
              id: 107,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
            {
              id: 108,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
            {
              id: 109,
              current: 0,
              last: null,
              next: null,
              done: false,
              checked: false,
            },
          ],
        },
      },
      { multi: true } // This option is not necessary for updateMany, but added for clarity
    )

    console.log('All users updated:', updateResult)

    if (updateResult) {
      return res.status(404).json({ results: updateResult })
    } else {
      res.status(500).json({ message: 'Error updating goal', error: 'custom' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal', error: error })

    console.error('Error updating users:', error)
  }
}
