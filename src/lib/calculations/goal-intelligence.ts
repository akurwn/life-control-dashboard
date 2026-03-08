export type GoalLog = {
  completed_date: string
}

export type GoalIntelligenceResult = {
  weeklyCompleted: number
  activeDays: number
  streak: number
  momentum: "Strong" | "Stable" | "Weak"
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function calculateGoalIntelligence(
  logs: GoalLog[]
): GoalIntelligenceResult {
  const today = new Date()
  const last7Days = new Set<string>()

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    last7Days.add(toDateString(d))
  }

  const completedDates = logs.map((log) => log.completed_date)
  const uniqueCompletedDates = new Set(completedDates)

  const weeklyCompleted = logs.filter((log) =>
    last7Days.has(log.completed_date)
  ).length

  const activeDays = [...uniqueCompletedDates].filter((date) =>
    last7Days.has(date)
  ).length

  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const ds = toDateString(d)

    if (uniqueCompletedDates.has(ds)) {
      streak += 1
    } else {
      break
    }
  }

  let momentum: "Strong" | "Stable" | "Weak" = "Weak"

  if (activeDays >= 5 || weeklyCompleted >= 8) {
    momentum = "Strong"
  } else if (activeDays >= 3 || weeklyCompleted >= 4) {
    momentum = "Stable"
  }

  return {
    weeklyCompleted,
    activeDays,
    streak,
    momentum,
  }
}