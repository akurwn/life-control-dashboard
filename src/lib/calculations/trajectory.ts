export type TrajectoryInput = {
  consistency: number
  goalProgress: number
  completedToday: number
}

export type TrajectoryResult = {
  label: "Improving" | "Stable" | "Falling Behind"
  description: string
}

export function calculateTrajectory({
  consistency,
  goalProgress,
  completedToday,
}: TrajectoryInput): TrajectoryResult {
  const score =
    consistency * 0.5 +
    goalProgress * 0.3 +
    (completedToday > 0 ? 20 : 0)

  if (score >= 75) {
    return {
      label: "Improving",
      description: "Kamu bergerak dengan ritme yang sehat menuju goalmu.",
    }
  }

  if (score >= 50) {
    return {
      label: "Stable",
      description: "Arahmu cukup stabil, tapi masih bisa dipercepat.",
    }
  }

  return {
    label: "Falling Behind",
    description: "Momentum kamu mulai melambat. Perlu dorongan lagi.",
  }
}