export type ProbabilityInput = {
  targetAmount: number
  currentAmount: number
  deadline: string
}

export type ProbabilityResult = {
  probability: number
  requiredDaily: number
  estimatedDaysNeeded: number | null
  insight: string
}

export function calculateGoalProbability({
  targetAmount,
  currentAmount,
  deadline,
}: ProbabilityInput): ProbabilityResult {
  const today = new Date()
  const targetDate = new Date(deadline)

  const gap = Math.max(targetAmount - currentAmount, 0)

  const msPerDay = 1000 * 60 * 60 * 24
  const rawDaysLeft = Math.ceil(
    (targetDate.getTime() - today.getTime()) / msPerDay
  )

  const daysLeft = Math.max(rawDaysLeft, 1)
  const requiredDaily = gap / daysLeft

  // asumsi sederhana MVP:
  // user idealnya bisa menabung 20% dari target harian saat ini
  // nanti ini akan diganti pakai data transaksi asli
  const assumedActualDaily = currentAmount > 0 ? currentAmount / 30 : 0

  const savingRate =
    requiredDaily > 0 ? assumedActualDaily / requiredDaily : 1

  const timeScore = Math.min(daysLeft / 90, 1)
  const progressScore =
    targetAmount > 0 ? Math.min(currentAmount / targetAmount, 1) : 0

  let probability =
    (savingRate * 0.5 + progressScore * 0.3 + timeScore * 0.2) * 100

  probability = Math.max(0, Math.min(probability, 100))

  const estimatedDaysNeeded =
    assumedActualDaily > 0 ? Math.ceil(gap / assumedActualDaily) : null

  let insight = "Goal kamu masih bisa dikejar."

  if (probability < 40) {
    insight =
      "Pola sekarang masih cukup berat. Kamu perlu menaikkan tabungan rutin agar target tercapai tepat waktu."
  } else if (probability < 70) {
    insight =
      "Target masih realistis, tapi butuh konsistensi yang lebih stabil dalam beberapa minggu ke depan."
  } else {
    insight =
      "Kamu ada di jalur yang sehat. Pertahankan ritme ini agar target tercapai sesuai deadline."
  }

  return {
    probability: Math.round(probability),
    requiredDaily: Math.round(requiredDaily),
    estimatedDaysNeeded,
    insight,
  }
}