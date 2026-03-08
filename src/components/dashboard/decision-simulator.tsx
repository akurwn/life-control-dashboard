"use client"

import { useMemo, useState } from "react"
import { simulateDecision } from "@/lib/calculations/decision-simulator"
import GoalTimelineImpact from "@/components/dashboard/goal-timeline-impact"
import {
  buildSimulatorPresets,
  type SimulatorPreset,
} from "@/lib/calculations/simulator-presets"

type DecisionSimulatorProps = {
  totalIncome: number
  totalExpense: number
  goals: {
    id: string
    title: string
    target_amount: number | string | null
    current_amount: number | string | null
    deadline: string | null
  }[]
}

function getScenarioInsight(
  presetKey: string | null,
  riskLabel: string,
  stabilityLabel: string
) {
  if (presetKey === "resign") {
    if (riskLabel === "Low Risk") {
      return "Kondisi kamu relatif cukup aman untuk mempertimbangkan resign, tapi tetap sebaiknya punya buffer dan rencana transisi yang jelas."
    }
    if (riskLabel === "Medium Risk") {
      return "Resign masih mungkin, tapi risikonya cukup terasa. Akan jauh lebih aman kalau kamu menambah buffer atau sumber income cadangan dulu."
    }
    return "Kalau kamu resign di kondisi ini, tekanan finansial bisa naik tajam dan beberapa goal berisiko tertunda cukup jauh."
  }

  if (presetKey === "income-drop") {
    return "Skenario ini membantu kamu melihat seberapa tahan kondisi keuanganmu kalau pemasukan turun dalam waktu dekat."
  }

  if (presetKey === "side-hustle" || presetKey === "start-freelance") {
    return "Skenario ini cocok untuk menguji apakah langkah menambah pemasukan baru benar-benar memberi dorongan sehat ke kondisi finansialmu."
  }

  if (presetKey === "big-purchase" || presetKey === "buy-laptop") {
    return "Skenario ini cocok untuk melihat apakah pembelian besar sekarang masih aman, atau justru akan memperlambat goal pentingmu."
  }

  if (presetKey === "pay-course") {
    return "Skenario ini membantu kamu menilai apakah investasi skill saat ini masih sehat untuk cashflow dan timeline goal."
  }

  if (presetKey === "emergency-buffer" || presetKey === "recovery") {
    return "Skenario ini menunjukkan potensi pemulihan kalau kamu menekan pengeluaran dan memperkuat buffer secara disiplin."
  }

  if (riskLabel === "Low Risk") {
    return "Skenario ini masih cukup aman. Fondasi finansial kamu masih mampu menopang perubahan."
  }

  if (riskLabel === "Medium Risk") {
    return "Skenario ini masih mungkin dijalani, tapi butuh kontrol yang lebih disiplin dan buffer yang jelas."
  }

  if (stabilityLabel === "Critical") {
    return "Skenario ini cukup berbahaya untuk kondisi saat ini. Risiko tekanan cashflow sangat tinggi."
  }

  return "Skenario ini punya tekanan yang cukup besar. Sebaiknya jangan dijalankan tanpa rencana cadangan."
}

function PresetGrid({
  title,
  presets,
  activePreset,
  onApply,
}: {
  title: string
  presets: SimulatorPreset[]
  activePreset: string | null
  onApply: (preset: SimulatorPreset) => void
}) {
  if (presets.length === 0) return null

  return (
    <div>
      <p className="mb-3 text-sm text-white/45">{title}</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {presets.map((preset) => {
          const isActive = activePreset === preset.key

          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => onApply(preset)}
              className={`rounded-3xl border p-4 text-left transition ${
                isActive
                  ? "border-white/10 bg-white text-black"
                  : "border-white/10 bg-black/20 text-white hover:bg-white/5"
              }`}
            >
              <p className="text-sm font-medium">{preset.label}</p>
              <p
                className={`mt-2 text-xs leading-5 ${
                  isActive ? "text-black/65" : "text-white/50"
                }`}
              >
                {preset.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DecisionSimulator({
  totalIncome,
  totalExpense,
  goals,
}: DecisionSimulatorProps) {
  const [incomeChangePercent, setIncomeChangePercent] = useState(-30)
  const [expenseChangePercent, setExpenseChangePercent] = useState(10)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const presetGroups = useMemo(() => buildSimulatorPresets(goals), [goals])

  const result = useMemo(() => {
    return simulateDecision({
      totalIncome,
      totalExpense,
      incomeChangePercent,
      expenseChangePercent,
    })
  }, [totalIncome, totalExpense, incomeChangePercent, expenseChangePercent])

  function applyPreset(preset: SimulatorPreset) {
    setIncomeChangePercent(preset.incomeChangePercent)
    setExpenseChangePercent(preset.expenseChangePercent)
    setActivePreset(preset.key)
  }

  function resetCustom() {
    setActivePreset(null)
  }

  const insight = getScenarioInsight(
    activePreset,
    result.riskLabel,
    result.stabilityLabel
  )

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <p className="text-sm text-white/45">Decision Simulator</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            Stress test kondisi finansialmu
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Uji skenario hidup dan keputusan nyata untuk melihat seberapa aman posisimu sebelum bergerak.
          </p>
        </div>

        <div className="space-y-6">
          <PresetGrid
            title="Core scenarios"
            presets={presetGroups.core}
            activePreset={activePreset}
            onApply={applyPreset}
          />

          <PresetGrid
            title="Recommended from your goals"
            presets={presetGroups.dynamic}
            activePreset={activePreset}
            onApply={applyPreset}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm text-white/60">
                  Income change (%)
                </label>
                <button
                  type="button"
                  onClick={resetCustom}
                  className="text-xs text-white/45 underline underline-offset-4 hover:text-white"
                >
                  Custom mode
                </button>
              </div>

              <input
                type="range"
                min={-100}
                max={100}
                value={incomeChangePercent}
                onChange={(e) => {
                  setIncomeChangePercent(Number(e.target.value))
                  setActivePreset(null)
                }}
                className="w-full"
              />
              <p className="mt-2 text-sm text-white/50">
                {incomeChangePercent > 0 ? "+" : ""}
                {incomeChangePercent}%
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Expense change (%)
              </label>
              <input
                type="range"
                min={-100}
                max={100}
                value={expenseChangePercent}
                onChange={(e) => {
                  setExpenseChangePercent(Number(e.target.value))
                  setActivePreset(null)
                }}
                className="w-full"
              />
              <p className="mt-2 text-sm text-white/50">
                {expenseChangePercent > 0 ? "+" : ""}
                {expenseChangePercent}%
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-white/50">New Income</p>
              <p className="mt-2 text-2xl font-semibold">
                Rp {result.newIncome.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-white/50">New Expense</p>
              <p className="mt-2 text-2xl font-semibold">
                Rp {result.newExpense.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-white/50">Net Flow</p>
              <p className="mt-2 text-2xl font-semibold">
                Rp {result.newNetFlow.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-white/50">Runway</p>
              <p className="mt-2 text-2xl font-semibold">
                {result.runwayMonths} mo
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-white/50">Stability</p>
              <p className="mt-2 text-2xl font-semibold">
                {result.stabilityScore}
              </p>
              <p className="mt-1 text-sm text-white/50">
                {result.stabilityLabel}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-white/50">Risk</p>
              <p className="mt-2 text-2xl font-semibold">{result.riskLabel}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/50">Scenario Insight</p>
          <p className="mt-3 text-sm leading-7 text-white/60">{insight}</p>
        </div>
      </section>

      <GoalTimelineImpact
        goals={goals}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        incomeChangePercent={incomeChangePercent}
        expenseChangePercent={expenseChangePercent}
      />
    </div>
  )
}