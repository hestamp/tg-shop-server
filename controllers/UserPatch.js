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

    if (req.body.notifications) {
      updateFields.notifications = req.body.notifications
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
    const repStat = req.body.repStat
    const repDate = req.body.repDate

    await UserModel.updateOne(
      { authId: UserId },
      {
        $push: { echos: newEcho },
        $inc: { 'stats.totalEchos': 1, 'stats.learnedTimes': 1 },
        $set: {
          'stats.repetitionEchoes.last': repDate,
          'stats.repetitionEchoes.count': repStat,
        },
      }
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
    const isRepeat = req.body.repeat || false
    const isCompleted = req.body.completed || false
    const repStat = req.body.repStat
    const repDate = req.body.repDate
    console.log(repStat)
    console.log(repDate)

    // Find the user by authId
    const user = await UserModel.findOne({ authId: UserId })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const echoIndex = user.echos.findIndex((echo) => echo.id == echoIdToEdit)

    if (echoIndex === -1) {
      return res.status(404).json({ message: 'Echo not found' })
    }

    // Update the echo in the echos array
    user.echos[echoIndex] = updatedEchoData
    if (isRepeat) {
      user.stats.learnedTimes = user.stats.learnedTimes + 1
    }
    if (isCompleted) {
      user.stats.completedEchoes = user.stats.completedEchoes + 1
    }
    if (repStat) {
      user.stats = { ...user.stats, 'repetitionEchoes.count': repStat }
    }
    if (repDate) {
      user.stats = { ...user.stats, 'repetitionEchoes.last': repDate }
    }

    // Save the updated user document
    const newuserSave = await user.save()
    console.log(newuserSave)

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

export const updateAchiveStat = async (req, res) => {
  try {
    console.log('this run')
    const UserId = req.body.authId
    const achiveId = req.body.achiveId
    const achiveChecked = req.body.checked
    const achiveDone = req.body.done

    // Find the user by authId
    const user = await UserModel.findOne({ authId: UserId })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const achiveIn = user.achive.find((achive) => achive.id == achiveId)
    const achiveIndex = user.achive.findIndex((achive) => achive.id == achiveId)

    if (achiveChecked) {
      achiveIn.checked = true
    }

    if (achiveDone) {
      achiveIn.done = true
    }

    console.log(achiveIn)
    console.log(achiveIndex)

    if (achiveIndex === -1) {
      return res.status(404).json({ message: 'Achive not found' })
    }
    user.achive[achiveIndex] = achiveIn

    // Save the updated user document
    await user.save()

    res.json({
      success: true,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Can't edit achive",
    })
  }
}
