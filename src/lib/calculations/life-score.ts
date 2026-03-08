export type LifeScoreInput = {
  goalProgress: number
  consistency: number
  stabilityScore: number
  completedToday: number
}

export type LifeScoreResult = {
  score: number
  label: "Low" | "Building" | "Strong" | "Excellent"
  insight: string
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export function calculateLifeScore({
  goalProgress,
  consistency,
  stabilityScore,
  completedToday,
}: LifeScoreInput): LifeScoreResult {
  const actionScore = clamp(completedToday * 12, 0, 100)

  const rawScore =
    goalProgress * 0.35 +
    consistency * 0.25 +
    stabilityScore * 0.25 +
    actionScore * 0.15

  const score = Math.round(clamp(rawScore, 0, 100))

  let label: "Low" | "Building" | "Strong" | "Excellent" = "Low"
  let insight =
    "Sistemmu belum cukup stabil. Fokus ke action kecil yang bisa kamu jaga setiap hari."

  if (score >= 80) {
    label = "Excellent"
    insight =
      "Kondisi sistemmu sangat sehat. Goal, ritme, dan stabilitasmu saling menguatkan."
  } else if (score >= 65) {
    label = "Strong"
    insight =
      "Kamu berada di jalur yang kuat. Tinggal jaga ritme supaya momentum tidak turun."
  } else if (score >= 45) {
    label = "Building"
    insight =
      "Fondasi kamu sedang terbentuk. Konsistensi kecil tiap hari akan memberi efek besar."
  }

  return {
    score,
    label,
    insight,
  }
}