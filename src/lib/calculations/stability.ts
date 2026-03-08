export type StabilityInput = {
  totalIncome: number
  totalExpense: number
}

export type StabilityResult = {
  score: number
  label: "Strong" | "Stable" | "Fragile" | "Critical"
  runwayMonths: number
  description: string
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export function calculateStability({
  totalIncome,
  totalExpense,
}: StabilityInput): StabilityResult {
  const income = Math.max(totalIncome, 0)
  const expense = Math.max(totalExpense, 0)

  const netFlow = income - expense

  // runway sederhana:
  // kalau income >= expense → dianggap cukup aman, runway tinggi
  // kalau expense > income → runway dihitung dari rasio income/expense
  const runwayMonths =
    expense <= 0
      ? 12
      : income >= expense
      ? 12
      : income / expense

  // Komponen score
  const incomeCoverageScore =
    expense <= 0 ? 40 : clamp((income / expense) * 40, 0, 40)

  const netFlowScore =
    income <= 0
      ? 0
      : clamp(((netFlow / Math.max(income, 1)) + 1) * 20, 0, 20)

  const runwayScore = clamp((runwayMonths / 6) * 25, 0, 25)

  const expenseControlScore =
    income <= 0
      ? 0
      : clamp((1 - expense / Math.max(income * 1.5, 1)) * 15, 0, 15)

  const rawScore =
    incomeCoverageScore +
    netFlowScore +
    runwayScore +
    expenseControlScore

  const score = Math.round(clamp(rawScore, 0, 100))

  let label: "Strong" | "Stable" | "Fragile" | "Critical" = "Critical"
  let description =
    "Cashflow kamu masih rapuh. Prioritas utamanya adalah menekan beban dan memperkuat pemasukan."

  if (score >= 80) {
    label = "Strong"
    description =
      "Fondasi finansial kamu cukup sehat. Cashflow relatif aman untuk mendukung goal jangka menengah."
  } else if (score >= 60) {
    label = "Stable"
    description =
      "Kondisi kamu cukup stabil, tapi masih perlu dijaga supaya tidak mudah goyah saat ada tekanan."
  } else if (score >= 40) {
    label = "Fragile"
    description =
      "Stabilitas kamu masih tipis. Sedikit tekanan tambahan bisa mengganggu progress goal lain."
  }

  return {
    score,
    label,
    runwayMonths: Number(runwayMonths.toFixed(1)),
    description,
  }
}