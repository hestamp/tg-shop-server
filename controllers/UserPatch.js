import UserModel from '../models/Usermodel.js'
import { postStat } from './Statistics.js'

function expToLvl(level) {
  // Calculate the experience required for the next level
  // For example: 1 lvl = 100exp, 2 lvl = 200 exp, 3 lvl = 300 exp, and so on
  return level * 100
}

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

    // Find and update the user in one step
    const updatedUser = await UserModel.findOneAndUpdate(
      { authId: UserId },
      {
        $push: { echos: newEcho },
        $inc: { 'stats.totalEchos': 1, 'stats.learnedTimes': 1 },
        $set: {
          'stats.repetitionEchoes.last': repDate,
          'stats.repetitionEchoes.count': repStat,
        },
        $inc: { 'stats.exp': 30 },
      },
      { new: true }
    )

    // Check if the user exists
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if the user leveled up
    while (updatedUser.stats.exp >= expToLvl(updatedUser.stats.level + 1)) {
      updatedUser.stats.level += 1
      updatedUser.stats.exp -= expToLvl(updatedUser.stats.level)
    }

    // Save the updated user in the database
    await updatedUser.save()

    res.json({
      success: true,
      userStats: updatedUser.stats,
    })

    // You may choose to post stats after updating the user's stats
    await postStat('echoes')
    await postStat('repetition')
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Can't create a new echo",
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
      user.stats.exp = user.stats.exp + 10
    }

    if (isCompleted) {
      user.stats.completedEchoes = user.stats.completedEchoes + 1
      user.stats.exp = user.stats.exp + 100
    }

    if (repStat) {
      user.stats = { ...user.stats, 'repetitionEchoes.count': repStat }
    }

    if (repDate) {
      user.stats = { ...user.stats, 'repetitionEchoes.last': repDate }
    }

    while (user.stats.exp >= expToLvl(user.stats.level + 1)) {
      user.stats.level += 1
      user.stats.exp -= expToLvl(user.stats.level)
    }
    // Save the updated user document
    const newuserSave = await user.save()

    res.json({
      success: true,
      userStats: user.stats,
    })

    if (isRepeat) {
      await postStat('repetition')
    }
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

    // Find the user and the echo to remove
    const user = await UserModel.findOne({ authId: UserId })
    const echoToRemove = user.echos.find((echo) => echo.id === echoIdToRemove)

    // Check if the user exists and if the echo to remove exists
    if (!user || !echoToRemove) {
      return res.status(404).json({ message: 'User or echo not found' })
    }

    // Calculate the experience to be added back (30 exp for removing the echo)
    const expToAddBack = 30

    // Check if removing the echo will result in negative exp
    if (user.stats.exp - expToAddBack < 0) {
      // Calculate the level to be decreased
      const levelsToDecrease = Math.ceil((user.stats.exp - expToAddBack) / 100)
      const newLevel = Math.max(user.stats.level - levelsToDecrease, 0)

      // Calculate the remaining exp after decreasing levels
      const remainingExp =
        user.stats.exp - expToAddBack + levelsToDecrease * 100

      // Update the user stats, setting the new level and remaining exp
      await UserModel.updateOne(
        { authId: UserId },
        {
          $pull: { echos: { id: echoIdToRemove } },
          $set: {
            'stats.level': newLevel,
            'stats.exp': remainingExp,
          },
        }
      )
    } else {
      // If removing the echo doesn't result in negative exp, update the user normally
      await UserModel.updateOne(
        { authId: UserId },
        {
          $pull: { echos: { id: echoIdToRemove } },
          $inc: { 'stats.exp': -expToAddBack }, // Decrease 30 exp for removing the echo
        }
      )
    }

    res.json({
      success: true,
      userStats: user.stats,
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
