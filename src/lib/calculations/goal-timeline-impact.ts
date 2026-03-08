export type GoalTimelineInput = {
  id: string
  title: string
  target_amount: number | string | null
  current_amount: number | string | null
  deadline: string | null
}

export type GoalTimelineImpactResult = {
  id: string
  title: string
  gap: number
  currentDailyCapacity: number
  scenarioDailyCapacity: number
  baselineDaysNeeded: number | null
  scenarioDaysNeeded: number | null
  impactDays: number | null
  status: "Ahead" | "Delayed" | "No Progress" | "On Track"
  deadline: string | null
}

function normalizeMoney(value: number) {
  return Math.max(0, Number.isFinite(value) ? value : 0)
}

export function calculateGoalTimelineImpact(params: {
  goals: GoalTimelineInput[]
  baselineNetFlow: number
  scenarioNetFlow: number
}) {
  const { goals, baselineNetFlow, scenarioNetFlow } = params

  // asumsi MVP:
  // 60% dari net flow positif bisa dipakai untuk mendorong goals
  const baselineDailyCapacity = Math.max(0, baselineNetFlow * 0.6) / 30
  const scenarioDailyCapacity = Math.max(0, scenarioNetFlow * 0.6) / 30

  const results: GoalTimelineImpactResult[] = goals.map((goal) => {
    const target = normalizeMoney(Number(goal.target_amount || 0))
    const current = normalizeMoney(Number(goal.current_amount || 0))
    const gap = Math.max(target - current, 0)

    const baselineDaysNeeded =
      baselineDailyCapacity > 0 ? Math.ceil(gap / baselineDailyCapacity) : null

    const scenarioDaysNeeded =
      scenarioDailyCapacity > 0 ? Math.ceil(gap / scenarioDailyCapacity) : null

    let impactDays: number | null = null
    let status: "Ahead" | "Delayed" | "No Progress" | "On Track" = "On Track"

    if (gap === 0) {
      status = "On Track"
      impactDays = 0
    } else if (scenarioDaysNeeded === null) {
      status = "No Progress"
      impactDays = null
    } else if (baselineDaysNeeded === null) {
      status = "Delayed"
      impactDays = scenarioDaysNeeded
    } else {
      impactDays = scenarioDaysNeeded - baselineDaysNeeded

      if (impactDays > 0) {
        status = "Delayed"
      } else if (impactDays < 0) {
        status = "Ahead"
      } else {
        status = "On Track"
      }
    }

    return {
      id: goal.id,
      title: goal.title,
      gap,
      currentDailyCapacity: Math.round(baselineDailyCapacity),
      scenarioDailyCapacity: Math.round(scenarioDailyCapacity),
      baselineDaysNeeded,
      scenarioDaysNeeded,
      impactDays,
      status,
      deadline: goal.deadline,
    }
  })

  return results
}