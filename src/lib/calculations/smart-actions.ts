type GoalLike = {
  id: string
  deadline: string | null
  target_amount: number | string | null
  current_amount: number | string | null
}

type ActionLike = {
  id: string
  goal_id: string
  title: string
  action_type: "check" | "number"
  target_value?: number | string | null
  unit?: string | null
  created_at?: string | null
}

type ActionLogLike = {
  action_id: string
  completed_date: string
}

export type RankedAction = ActionLike & {
  score: number
  reason: string
}

function daysUntil(dateString: string | null) {
  if (!dateString) return 999

  const today = new Date()
  const target = new Date(dateString)

  const msPerDay = 1000 * 60 * 60 * 24
  return Math.ceil((target.getTime() - today.getTime()) / msPerDay)
}

function getGoalProgress(goal: GoalLike) {
  const target = Number(goal.target_amount || 0)
  const current = Number(goal.current_amount || 0)

  if (target <= 0) return 0
  return Math.max(0, Math.min((current / target) * 100, 100))
}

export function rankSmartActions(
  actions: ActionLike[],
  goals: GoalLike[],
  logs: ActionLogLike[],
  today: string
): RankedAction[] {
  const goalMap = new Map(goals.map((goal) => [goal.id, goal]))

  const lastCompletedMap = new Map<string, string>()

  for (const log of logs) {
    const existing = lastCompletedMap.get(log.action_id)

    if (!existing || new Date(log.completed_date) > new Date(existing)) {
      lastCompletedMap.set(log.action_id, log.completed_date)
    }
  }

  const completedTodaySet = new Set(
    logs
      .filter((log) => log.completed_date === today)
      .map((log) => log.action_id)
  )

  const ranked = actions
    .filter((action) => !completedTodaySet.has(action.id))
    .map((action) => {
      const goal = goalMap.get(action.goal_id)

      let score = 0
      let reason = "Recommended"

      if (goal) {
        const progress = getGoalProgress(goal)
        const daysLeft = daysUntil(goal.deadline)

        // Goal progress rendah = lebih prioritas
        if (progress < 30) {
          score += 35
          reason = "Goal progress masih rendah"
        } else if (progress < 60) {
          score += 20
          reason = "Goal progress masih butuh dorongan"
        } else {
          score += 8
        }

        // Deadline dekat = lebih urgent
        if (daysLeft <= 7) {
          score += 30
          reason = "Deadline sangat dekat"
        } else if (daysLeft <= 30) {
          score += 18
        } else if (daysLeft <= 90) {
          score += 8
        }
      }

      // Sudah lama tidak dikerjakan = naik prioritas
      const lastCompleted = lastCompletedMap.get(action.id)

      if (!lastCompleted) {
        score += 20
        reason = "Belum pernah dikerjakan"
      } else {
        const diffDays = Math.floor(
          (new Date(today).getTime() - new Date(lastCompleted).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        if (diffDays >= 7) {
          score += 20
          reason = "Sudah lama tidak disentuh"
        } else if (diffDays >= 3) {
          score += 10
        }
      }

      return {
        ...action,
        score,
        reason,
      }
    })
    .sort((a, b) => b.score - a.score)

  return ranked
}