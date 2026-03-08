export type RiskInsightGoal = {
  id: string
  title: string
  target_amount: number | string | null
  current_amount: number | string | null
  deadline: string | null
}

export type RiskInsightInput = {
  stabilityLabel: "Strong" | "Stable" | "Fragile" | "Critical"
  consistency: number
  goals: RiskInsightGoal[]
}

export type RiskInsightResult = {
  biggestRisk: string
  vulnerableGoalTitle: string | null
  safestMove: string
  recommendedFocus: string
}

function daysUntil(dateString: string | null) {
  if (!dateString) return 999

  const today = new Date()
  const target = new Date(dateString)
  const msPerDay = 1000 * 60 * 60 * 24

  return Math.ceil((target.getTime() - today.getTime()) / msPerDay)
}

function goalProgress(goal: RiskInsightGoal) {
  const target = Number(goal.target_amount || 0)
  const current = Number(goal.current_amount || 0)

  if (target <= 0) return 0
  return Math.max(0, Math.min((current / target) * 100, 100))
}

export function calculateRiskInsight({
  stabilityLabel,
  consistency,
  goals,
}: RiskInsightInput): RiskInsightResult {
  let biggestRisk =
    "Kondisi kamu cukup aman, tapi tetap perlu menjaga ritme progress dan stabilitas."

  if (stabilityLabel === "Critical") {
    biggestRisk =
      "Tekanan finansial adalah risiko terbesar saat ini. Goal bisa melambat jika cashflow tidak segera diperkuat."
  } else if (stabilityLabel === "Fragile") {
    biggestRisk =
      "Stabilitas finansial masih tipis. Keputusan besar berpotensi menunda beberapa goal penting."
  } else if (consistency < 40) {
    biggestRisk =
      "Ritme eksekusi kamu masih lemah. Risiko terbesar sekarang adalah kehilangan momentum, bukan kehilangan tujuan."
  } else if (consistency < 60) {
    biggestRisk =
      "Progress masih berjalan, tapi konsistensinya belum cukup kuat untuk menjaga goal tetap on track."
  }

  let vulnerableGoalTitle: string | null = null
  let highestRiskScore = -1

  for (const goal of goals) {
    const progress = goalProgress(goal)
    const daysLeft = daysUntil(goal.deadline)

    let riskScore = 0

    if (progress < 30) riskScore += 40
    else if (progress < 60) riskScore += 20

    if (daysLeft <= 14) riskScore += 35
    else if (daysLeft <= 30) riskScore += 20
    else if (daysLeft <= 90) riskScore += 10

    if (riskScore > highestRiskScore) {
      highestRiskScore = riskScore
      vulnerableGoalTitle = goal.title
    }
  }

  let safestMove =
    "Pertahankan ritme action harian dan hindari keputusan finansial besar tanpa simulasi."

  if (stabilityLabel === "Critical" || stabilityLabel === "Fragile") {
    safestMove =
      "Mode paling aman minggu ini adalah menekan expense non-esensial dan memperkuat buffer."
  } else if (consistency < 50) {
    safestMove =
      "Mode paling aman minggu ini adalah fokus ke 1–2 action kecil per hari yang menjaga momentum tetap hidup."
  }

  let recommendedFocus =
    "Dorong goal yang deadline-nya paling dekat atau progress-nya paling tertinggal."

  if (vulnerableGoalTitle) {
    recommendedFocus = `Fokuskan energi minggu ini ke goal "${vulnerableGoalTitle}" karena itu yang paling rentan tertinggal.`
  }

  return {
    biggestRisk,
    vulnerableGoalTitle,
    safestMove,
    recommendedFocus,
  }
}