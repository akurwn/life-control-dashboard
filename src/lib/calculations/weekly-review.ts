export type GoalSummaryInput = {
  id: string
  title: string
  target_amount: number | string | null
  current_amount: number | string | null
}

export type GoalActionLogInput = {
  action_id: string
  completed_date: string
}

export type GoalActionInput = {
  id: string
  goal_id: string
}

export type WeeklyReviewResult = {
  totalCompletedActions: number
  activeDays: number
  consistency: number
  strongestGoalTitle: string | null
  weakestGoalTitle: string | null
  momentum: "Strong" | "Stable" | "Weak"
  recommendation: string
}

function getGoalProgress(goal: GoalSummaryInput) {
  const target = Number(goal.target_amount || 0)
  const current = Number(goal.current_amount || 0)

  if (target <= 0) return 0
  return Math.max(0, Math.min((current / target) * 100, 100))
}

export function calculateWeeklyReview(params: {
  goals: GoalSummaryInput[]
  actions: GoalActionInput[]
  logs: GoalActionLogInput[]
}) {
  const { goals, actions, logs } = params

  const uniqueDays = new Set(logs.map((log) => log.completed_date))
  const activeDays = uniqueDays.size
  const totalCompletedActions = logs.length
  const consistency = Math.round((activeDays / 7) * 100)

  const actionsByGoal = new Map<string, string[]>()
  for (const action of actions) {
    const arr = actionsByGoal.get(action.goal_id) || []
    arr.push(action.id)
    actionsByGoal.set(action.goal_id, arr)
  }

  const logCountByAction = new Map<string, number>()
  for (const log of logs) {
    logCountByAction.set(log.action_id, (logCountByAction.get(log.action_id) || 0) + 1)
  }

  let strongestGoalTitle: string | null = null
  let weakestGoalTitle: string | null = null
  let strongestScore = -1
  let weakestScore = Number.POSITIVE_INFINITY

  for (const goal of goals) {
    const progress = getGoalProgress(goal)
    const actionIds = actionsByGoal.get(goal.id) || []
    const weeklyActivity = actionIds.reduce(
      (sum, actionId) => sum + (logCountByAction.get(actionId) || 0),
      0
    )

    const score = progress * 0.6 + Math.min(weeklyActivity * 8, 40)

    if (score > strongestScore) {
      strongestScore = score
      strongestGoalTitle = goal.title
    }

    if (score < weakestScore) {
      weakestScore = score
      weakestGoalTitle = goal.title
    }
  }

  let momentum: "Strong" | "Stable" | "Weak" = "Weak"
  if (consistency >= 75 || totalCompletedActions >= 10) {
    momentum = "Strong"
  } else if (consistency >= 45 || totalCompletedActions >= 5) {
    momentum = "Stable"
  }

  let recommendation =
    "Fokus ke 1–2 goal paling penting minggu depan dan jaga ritme action tetap hidup."

  if (momentum === "Strong") {
    recommendation =
      "Momentum kamu sedang bagus. Pertahankan ritme ini dan dorong goal yang paling dekat dengan hasil."
  } else if (momentum === "Stable") {
    recommendation =
      "Progress kamu cukup sehat, tapi masih bisa dipercepat dengan action yang lebih konsisten di awal minggu."
  } else {
    recommendation =
      "Minggu depan prioritaskan action yang paling kecil tapi paling penting, supaya momentum kamu hidup lagi."
  }

  const result: WeeklyReviewResult = {
    totalCompletedActions,
    activeDays,
    consistency,
    strongestGoalTitle,
    weakestGoalTitle,
    momentum,
    recommendation,
  }

  return result
}