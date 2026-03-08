type WeeklyLogInput = {
  completed_date: string
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function buildWeeklyActivityData(logs: WeeklyLogInput[]) {
  const today = new Date()
  const data: { day: string; completed: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)

    const ds = toDateString(d)
    const count = logs.filter((log) => log.completed_date === ds).length

    data.push({
      day: formatDayLabel(d),
      completed: count,
    })
  }

  return data
}