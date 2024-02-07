import UserModel from '../models/Usermodel.js'

export default async (req, res, next) => {
  const userId = req.body.authId
  const founduser = await UserModel.findOne({ authId: userId })

  if (!userId) {
    return res.status(403).json({
      message: 'No accsess',
    })
  }

  if (founduser) {
    req.founduser = founduser
    next()
  } else {
    console.log(`Someone with ip ${req.ip} send request for auth without id!`)

    return res.status(403).json({
      message: 'No accsess',
    })
  }
}
