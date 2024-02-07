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

        console.log(userData)

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
