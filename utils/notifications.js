import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js' // Import UTC plugin if needed
import timezone from 'dayjs/plugin/timezone.js' // Import timezone plugin if needed
dayjs.extend(utc)
dayjs.extend(timezone)
import UserModel from '../models/Usermodel.js'

const generateNoEchoMessage = () => {
  const messages = [
    "You don't have any echoes scheduled for today. Why not take this opportunity to learn something new?",
    'No echoes to repeat for today. How about using this time to expand your knowledge?',
    "Looks like you're echo-free for today. Why not explore new topics to enhance your skills?",
    'No echoes on your schedule today. Take this chance to dive into a new subject!',
    'Echo-less day ahead! Use this time to discover something new and exciting.',
    "Today's a blank slate for echoes. How about filling it with some fresh learning?",
    'No echoes to repeat for today. Embrace the opportunity to explore new horizons!',
    'Your schedule is echo-free today. Use this time to enrich your mind with fresh insights.',
    'Echo-free zone for today. Seize the moment to embark on a learning adventure!',
    'No echoes scheduled. Dive into the world of knowledge and create new echoes!',
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

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
          ' , '
        )} and ${remainingEchoes} more echoes to continue your streak`,
      `You have ${numEchoes} echoes scheduled for today. Start with ${echoNames
        .slice(0, 2)
        .join(' , ')} and continue with the rest`,
      `Today's echoes include ${echoNames
        .slice(0, 2)
        .join(
          ' , '
        )} and ${remainingEchoes} more. Make sure to complete them all!`,
      `To keep your momentum going, repeat ${echoNames
        .slice(0, 2)
        .join(', ')} today, and don't forget about the others`,
      `Make today count by starting with ${echoNames
        .slice(0, 2)
        .join(
          ' , '
        )} and then completing the remaining ${remainingEchoes} echoes`,
      `Echoes for today: ${echoNames
        .slice(0, 2)
        .join(', ')} and ${remainingEchoes} more`,
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

    return { today: today, echoNames: echoNamesForToday }
  } catch (error) {
    console.error('Error checking for scheduled echo:', error)
    return { today: false, echoNames: [] } // Return empty array in case of error
  }
}

export const sendNotificationsToUsers = async ({ bot }) => {
  try {
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
        const { today, echoNames } = await checkForScheduledEcho(user)
        const userId = user.tgid
        const userName = user.fullName

        if (today) {
          const message = generateEchoMessage(echoNames)

          // Send notification to user
          console.log(
            `Sending notification to user ${userName} with id: ${userId}, remind to repeat added echoes`
          )

          bot
            .sendMessage(userId, message)
            .then((response) => console.log('Message sent'))
            .catch((error) => console.error(error))
        } else {
          if (user.notifications.empty == true) {
            const messageNoEchoes = generateNoEchoMessage()
            console.log(
              `Sending notification to user ${userName} with id: ${userId}, remind to add some echoes`
            )

            bot
              .sendMessage(userId, messageNoEchoes)
              .then((response) => console.log('Message sent'))
              .catch((error) => console.error(error))
          } else {
          }
        }
      }
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
  }
}
