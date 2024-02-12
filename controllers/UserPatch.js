import UserModel from '../models/Usermodel.js'

export const settingUpdate = async (req, res) => {
  try {
    const UserId = req.body.authId

    const updateFields = {}

    // if (req.body.clothes) {
    //   updateFields.clothes = req.body.clothes
    // }

    if (req.body.fullName) {
      updateFields.fullName = req.body.fullName
    }

    if (req.body.quotes) {
      updateFields.quotes = req.body.quotes
    }

    await UserModel.updateOne(
      {
        authId: UserId,
      },
      updateFields
    )

    res.json({
      success: true,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Cant update setting',
    })
    // errorHandler(error, req)
  }
}
export const notiftimeUpdate = async (req, res) => {
  try {
    const UserId = req.body.authId
    const newTime = req.body.newtime

    // Construct the update object
    const updateFields = {}
    if (newTime !== undefined) {
      updateFields['notifications.time'] = newTime
    }
    await UserModel.updateOne(
      {
        authId: UserId,
      },
      updateFields
    )

    res.json({
      success: true,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Cant update setting',
    })
    // errorHandler(error, req)
  }
}

export const goalUpdate = async (req, res) => {
  try {
    const UserId = req.body.authId
    console.log(UserId)
    const updateFields = {}
    console.log(req.body.goal)
    if (req.body.goal) {
      updateFields.goal = req.body.goal
    }

    await UserModel.updateOne(
      {
        authId: UserId,
      },
      updateFields
    )

    res.json({
      success: true,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Cant update setting',
    })
  }
}

export const createEcho = async (req, res) => {
  try {
    const UserId = req.body.authId
    const newEcho = req.body.newEcho

    await UserModel.updateOne(
      { authId: UserId },
      { $push: { echos: newEcho }, $inc: { 'stats.totalEchos': 1 } }
    )

    res.json({
      success: true,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Can't create new echo",
    })
  }
}

export const editEcho = async (req, res) => {
  try {
    const UserId = req.body.authId
    const echoIdToEdit = req.body.echoId
    const updatedEchoData = req.body.updatedEchoData

    console.log(updatedEchoData)

    // Find the user by authId
    const user = await UserModel.findOne({ authId: UserId })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const echoIndex = user.echos.findIndex((echo) => echo.id === echoIdToEdit)

    if (echoIndex === -1) {
      return res.status(404).json({ message: 'Echo not found' })
    }

    // Update the echo in the echos array
    user.echos[echoIndex] = updatedEchoData

    // Save the updated user document
    await user.save()

    res.json({
      success: true,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Can't edit echo",
    })
  }
}

export const removeEcho = async (req, res) => {
  try {
    const UserId = req.body.authId
    const echoIdToRemove = req.body.echoId

    await UserModel.updateOne(
      {
        authId: UserId,
      },
      { $pull: { echos: { id: echoIdToRemove } } }
    )

    res.json({
      success: true,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Can't remove echo",
    })
  }
}
