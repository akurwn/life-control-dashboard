import { calculateStability } from "@/lib/calculations/stability"

export type DecisionSimulatorInput = {
  totalIncome: number
  totalExpense: number
  incomeChangePercent: number
  expenseChangePercent: number
}

export type DecisionSimulatorResult = {
  newIncome: number
  newExpense: number
  newNetFlow: number
  stabilityScore: number
  stabilityLabel: "Strong" | "Stable" | "Fragile" | "Critical"
  runwayMonths: number
  riskLabel: "Low Risk" | "Medium Risk" | "High Risk"
}

export function simulateDecision({
  totalIncome,
  totalExpense,
  incomeChangePercent,
  expenseChangePercent,
}: DecisionSimulatorInput): DecisionSimulatorResult {
  const newIncome = Math.max(
    0,
    totalIncome * (1 + incomeChangePercent / 100)
  )

  const newExpense = Math.max(
    0,
    totalExpense * (1 + expenseChangePercent / 100)
  )

  const newNetFlow = newIncome - newExpense

  const stability = calculateStability({
    totalIncome: newIncome,
    totalExpense: newExpense,
  })

  let riskLabel: "Low Risk" | "Medium Risk" | "High Risk" = "High Risk"

  if (stability.score >= 80) {
    riskLabel = "Low Risk"
  } else if (stability.score >= 55) {
    riskLabel = "Medium Risk"
  }

  return {
    newIncome: Math.round(newIncome),
    newExpense: Math.round(newExpense),
    newNetFlow: Math.round(newNetFlow),
    stabilityScore: stability.score,
    stabilityLabel: stability.label,
    runwayMonths: stability.runwayMonths,
    riskLabel,
  }
}