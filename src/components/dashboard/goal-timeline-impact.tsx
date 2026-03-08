"use client"

import { simulateDecision } from "@/lib/calculations/decision-simulator"
import { calculateGoalTimelineImpact } from "@/lib/calculations/goal-timeline-impact"

type GoalTimelineImpactProps = {
  goals: {
    id: string
    title: string
    target_amount: number | string | null
    current_amount: number | string | null
    deadline: string | null
  }[]
  totalIncome: number
  totalExpense: number
  incomeChangePercent: number
  expenseChangePercent: number
}

export default function GoalTimelineImpact({
  goals,
  totalIncome,
  totalExpense,
  incomeChangePercent,
  expenseChangePercent,
}: GoalTimelineImpactProps) {
  const simulation = simulateDecision({
    totalIncome,
    totalExpense,
    incomeChangePercent,
    expenseChangePercent,
  })

  const baselineNetFlow = totalIncome - totalExpense
  const scenarioNetFlow = simulation.newNetFlow

  const impacts = calculateGoalTimelineImpact({
    goals,
    baselineNetFlow,
    scenarioNetFlow,
  })

  const activeImpacts = impacts.filter((goal) => goal.gap > 0)

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <p className="text-sm text-white/45">Goal Timeline Impact</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          Pengaruh skenario ke timeline goal
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Simulasi ini menunjukkan apakah keputusan finansialmu akan mempercepat atau memperlambat goal yang sedang kamu kejar.
        </p>
      </div>

      {activeImpacts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/60">
            Belum ada goal terukur yang bisa dianalisis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeImpacts.map((goal) => (
            <div
              key={goal.id}
              className="rounded-3xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{goal.title}</p>
                  <p className="mt-1 text-sm text-white/50">
                    Gap: Rp {goal.gap.toLocaleString("id-ID")}
                    {goal.deadline ? ` • Deadline: ${goal.deadline}` : ""}
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {goal.status}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Baseline pace</p>
                  <p className="mt-2 text-xl font-semibold">
                    Rp {goal.currentDailyCapacity.toLocaleString("id-ID")}/day
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Scenario pace</p>
                  <p className="mt-2 text-xl font-semibold">
                    Rp {goal.scenarioDailyCapacity.toLocaleString("id-ID")}/day
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Baseline finish</p>
                  <p className="mt-2 text-xl font-semibold">
                    {goal.baselineDaysNeeded !== null
                      ? `${goal.baselineDaysNeeded} days`
                      : "No pace"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/45">Scenario finish</p>
                  <p className="mt-2 text-xl font-semibold">
                    {goal.scenarioDaysNeeded !== null
                      ? `${goal.scenarioDaysNeeded} days`
                      : "No progress"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-6 text-white/60">
                  {goal.status === "Delayed" &&
                    `Dengan skenario ini, goal ini diperkirakan mundur ${
                      goal.impactDays ?? 0
                    } hari dibanding kondisi sekarang.`}
                  {goal.status === "Ahead" &&
                    `Dengan skenario ini, goal ini bisa lebih cepat ${
                      Math.abs(goal.impactDays ?? 0)
                    } hari dibanding kondisi sekarang.`}
                  {goal.status === "On Track" &&
                    "Skenario ini belum memberi perubahan timeline yang berarti untuk goal ini."}
                  {goal.status === "No Progress" &&
                    "Dengan skenario ini, goal ini kehilangan kapasitas progress harian dan berisiko berhenti bergerak."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}