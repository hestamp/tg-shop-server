import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js' // Import UTC plugin if needed
import timezone from 'dayjs/plugin/timezone.js' // Import timezone plugin if needed

import UserModel from '../models/Usermodel.js'

dayjs.extend(utc)
dayjs.extend(timezone)

const generateEchoMessage = (echoNames) => {
  const numEchoes = echoNames.length

  if (numEchoes <= 2) {
    // Messages for 2 or fewer echoes
    const messages = [
      `For today you need to repeat ${echoNames.join(
        ' and '
      )} to continue your streak`,
      `You have echoes scheduled for today: ${echoNames.join(' and ')}`,
      `Don't forget to repeat ${echoNames.join(
        ' and '
      )} today to keep up with your routine`,
      `Today's echoes include ${echoNames.join(
        ' and '
      )}. Make sure to repeat them!`,
      `Your schedule for today includes ${echoNames.join(
        ' and '
      )}. Repeat them to stay on track`,
      `Echoes for today: ${echoNames.join(' and ')}`,
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  } else {
    // Messages for more than 2 echoes
    const remainingEchoes = numEchoes - 2
    const messages = [
      `For now you need to repeat ${echoNames
        .slice(0, 2)
        .join(
          ' and '
        )} and ${remainingEchoes} more echoes to continue your streak`,
      `You have ${numEchoes} echoes scheduled for today. Start with ${echoNames
        .slice(0, 2)
        .join(' and ')} and continue with the rest`,
      `Today's echoes include ${echoNames
        .slice(0, 2)
        .join(
          ' and '
        )} and ${remainingEchoes} more. Make sure to complete them all!`,
      `To keep your momentum going, repeat ${echoNames
        .slice(0, 2)
        .join(' and ')} today, and don't forget about the others`,
      `Make today count by starting with ${echoNames
        .slice(0, 2)
        .join(
          ' and '
        )} and then completing the remaining ${remainingEchoes} echoes`,
      `Echoes for today: ${echoNames
        .slice(0, 2)
        .join(' and ')} and ${remainingEchoes} more`,
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }
}

const checkForScheduledEcho = async (user) => {
  try {
    // Get current date without time
    const currentDate = dayjs().format('YYYY-MM-DD')

    // Array to store echo names for today
    const echoNamesForToday = []

    // Iterate over echos for the user
    user.echos.forEach((echo) => {
      // Iterate over dates in the echo
      echo.dates.forEach((date) => {
        // Extract the date part without time
        const echoDate = dayjs(date).format('YYYY-MM-DD')

        // Compare the dates
        if (currentDate === echoDate) {
          // Echo scheduled for the same date

          echoNamesForToday.push(echo.name) // Push echo name to array
        }
      })
    })

    const today = echoNamesForToday.length > 0

    return { today, echoNames: echoNamesForToday }
  } catch (error) {
    console.error('Error checking for scheduled echo:', error)
    return { today: false, echoNames: [] } // Return empty array in case of error
  }
}

export const sendNotificationsToUsers = async () => {
  try {
    // Get current server time
    const serverTime = dayjs().format('HH:mm')

    // Get all users with notifications enabled
    const users = await UserModel.find({
      'notifications.echoes': true,
      'notifications.time': { $ne: null }, // Ensure users have set notification time
    })

    // Iterate over users
    users.forEach(async (user) => {
      const userTimezone = user.timezone || 'UTC' // Use UTC if timezone not set for user

      const userTime = dayjs()
        .tz(userTimezone)
        .format('hh:mm A')
        .replace(/^0/, '')
        .toLowerCase() // Convert server time to user's timezone

      // Convert server time to user's timezone

      if (user.notifications.time == userTime) {
        const { today, echoNames } = checkForScheduledEcho(user)

        if (today) {
          const message = generateEchoMessage(echoNames)

          // Send notification to user
          console.log(`Sending notification to user ${user.id}`)
          const userId = user.tgid
          bot
            .sendMessage(userId, message)
            .then((response) => console.log('Message sent'))
            .catch((error) => console.error(error))
        }
      }
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
  }
}
