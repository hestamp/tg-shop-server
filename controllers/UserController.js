import UserModel from '../models/User.js'

export const geUser = async (req, res) => {
  if (req.body.sub) {
    try {
      const nowUnix = Date.now()
      const iso8601Date = nowUnix

      const founduser = await UserModel.findOne({ authId: req.body.sub })
      if (!founduser) {
        const signUpFields = {}

        signUpFields.authId = req.body.sub
        signUpFields.provider = req.body.provider
        signUpFields.clothes = req.body.clothes
        signUpFields.lang = req.body.lang
        signUpFields.lastVisit = iso8601Date

        const doc = new UserModel(signUpFields)

        const newuser = await doc.save()
        if (newuser) {
          const userfiles = newuser._doc

          res.json({
            user: userfiles,
          })
        } else {
          res.status(500).json({
            error: true,
            message: 'Some error',
          })
        }
      } else if (founduser) {
        const userfoundfile = founduser._doc

        const updateFields = {
          lastIp: '',
          country: 'user country',
          lastVisit: iso8601Date,
          visitcounter: visitcounter + 1,
        }

        await UserModel.updateOne(
          {
            authId: req.body.sub,
          },
          updateFields
        )

        res.json(userfoundfile)
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({
        message: 'No access',
      })
    }
  } else {
    res.status(500).json({
      message: 'No data - no access',
    })
  }
}

export const checkUser = async (idreq) => {
  if (idreq) {
    console.log(`we get id ${idreq}`)
    try {
      const nowUnix = Date.now()
      const iso8601Date = nowUnix

      const founduser = await UserModel.findOne({ authId: idreq })
      if (!founduser) {
        // const signUpFields = {}

        // signUpFields.authId = req.body.sub
        // signUpFields.avatar = req.body.picture
        // signUpFields.authProvider = provider
        // signUpFields.clothes = req.body.clothes
        // signUpFields.country = 'user country'
        // signUpFields.lastVisit = iso8601Date

        // if (provider == 'google-oauth2') {
        //   signUpFields.email = req.body.email
        //   signUpFields.confirmed = req.body.email_verified
        //   signUpFields.fullName = req.body.name
        // } else if (provider == 'apple') {
        //   const userName = req.body.name == '' ? 'User' : req.body.name
        //   signUpFields.fullName = userName
        // } else if (provider == 'auth0') {
        //   signUpFields.email = req.body.email
        //   signUpFields.fullName = req.body.nickname
        //   signUpFields.confirmed = req.body.email_verified
        // } else {
        //   res.status(500).json({
        //     message: 'No data - no access',
        //   })
        // }

        const signUpFields = {
          authId: idreq,
          msgcount: 1,
        }

        const doc = new UserModel(signUpFields)

        const newuser = await doc.save()
        console.log('user created')
        console.log(newuser._doc)
        return newuser._doc
        // if (newuser) {
        //   const {
        //     authProvider,
        //     confirmed,
        //     _id,
        //     lastIp,
        //     searched,
        //     visited,
        //     lastVisit,
        //     country,
        //     createdAt,
        //     updatedAt,
        //     visitcounter,
        //     __v,
        //     ...userData
        //   } = newuser._doc

        //   res.json({
        //     ...userData,
        //   })
        // } else {
        //   res.status(500).json({
        //     message: 'Some error',
        //   })
        // }
      } else if (founduser) {
        // const {
        //   authProvider,
        //   confirmed,
        //   _id,
        //   v,
        //   lastIp,
        //   searched,
        //   visited,
        //   lastVisit,
        //   createdAt,
        //   updatedAt,
        //   visitcounter,
        //   country,
        //   __v,
        //   ...userData
        // } = founduser._doc
        console.log('user was found')
        console.log(founduser._doc)

        const updateFields = {
          $inc: { msgcount: +1 },
        }

        await UserModel.updateOne(
          {
            authId: idreq,
          },
          updateFields
        )
        return founduser._doc
        // res.json(userData)
      }
    } catch (error) {
      console.log(error)
      console.log('user get error')
      return null
      // res.status(500).json({
      //   message: 'No access',
      // })
    }
  } else {
    // res.status(500).json({
    //   message: 'No data - no access',
    // })
    console.log('some error')
    return null
  }
}
