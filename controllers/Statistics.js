import StatSchema from '../models/StatisticsModel.js'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const postStat = async (name, check) => {
  const campaign = name
  const nesPlus = check == true ? 0 : 1

  if (!campaign) {
    return false
  }

  try {
    const today = dateFormatter.format(new Date())
    const currentMonth = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
    }).format(new Date())
    const clickData = await StatSchema.findOne({ name: campaign })

    if (clickData) {
      clickData.days.set(today, (clickData.days.get(today) || 0) + nesPlus)

      clickData.stat.set(
        currentMonth,
        (clickData.stat.get(currentMonth) || 0) + nesPlus
      )
      clickData.total += nesPlus

      await clickData.save()
    } else {
      // Create a new entry if it doesn't exist
      const newClickData = new StatSchema({
        name: campaign,
        days: new Map([[today, nesPlus]]),
        stat: new Map([[currentMonth, nesPlus]]),
        total: nesPlus,
      })
      const newres = await newClickData.save()
    }

    return true
  } catch (error) {
    console.error('Error in postStat:', error)
    return false
  }
}
