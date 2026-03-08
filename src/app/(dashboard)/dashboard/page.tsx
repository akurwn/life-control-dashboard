import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

import TodayActions from "@/components/dashboard/today-actions"
import GoalsList from "@/components/dashboard/goals-list"
import TransactionsList from "@/components/dashboard/transactions-list"
import RiskInsightCard from "@/components/dashboard/risk-insight-card"

import { calculate7DayConsistency } from "@/lib/calculations/consistency"
import { calculateStability } from "@/lib/calculations/stability"
import { calculateLifeScore } from "@/lib/calculations/life-score"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const today = new Date().toISOString().slice(0, 10)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 6)
  const start = startDate.toISOString().slice(0, 10)

  const [goalsResult, transactionsResult, logsResult, todayLogsResult] =
    await Promise.all([
      supabase.from("goals").select("*").eq("user_id", user.id),

      supabase
        .from("transactions")
        .select("type, amount")
        .eq("user_id", user.id),

      supabase
        .from("action_logs")
        .select("completed_date")
        .eq("user_id", user.id)
        .gte("completed_date", start),

      supabase
        .from("action_logs")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("completed_date", today),
    ])

  const goals = goalsResult.data || []
  const transactions = transactionsResult.data || []
  const logs = logsResult.data || []
  const completedToday = todayLogsResult.count || 0

  const totalTarget =
    goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0) || 0

  const totalCurrent =
    goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0) || 0

  const goalProgress =
    totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

  const completedDates = logs.map((log) => log.completed_date)
  const consistency = calculate7DayConsistency(completedDates)

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const stability = calculateStability({
    totalIncome,
    totalExpense,
  })

  const lifeScore = calculateLifeScore({
    goalProgress,
    consistency: consistency.consistency,
    stabilityScore: stability.score,
    completedToday,
  })

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/50">Today Focus</p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          What moves your life forward today
        </h2>

        <p className="mt-2 text-sm text-white/60">
          Sistem memilih action dengan dampak terbesar untuk menjaga momentum goal kamu.
        </p>

        <div className="mt-6">
          <TodayActions />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Life Score</p>

          <h3 className="mt-3 text-5xl font-semibold">{lifeScore.score}</h3>

          <p className="mt-2 text-sm text-white/50">{lifeScore.label}</p>
          <p className="mt-3 text-sm leading-6 text-white/60">
            {lifeScore.insight}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Goal Progress</p>

          <h3 className="mt-3 text-4xl font-semibold">{goalProgress}%</h3>

          <p className="mt-2 text-sm text-white/50">
            Rp {totalCurrent.toLocaleString("id-ID")} / Rp{" "}
            {totalTarget.toLocaleString("id-ID")}
          </p>

          <div className="mt-4 h-2.5 w-full rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-white transition-all"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Money Status</p>

          <h3 className="mt-3 text-4xl font-semibold">{stability.score}</h3>

          <p className="mt-2 text-sm text-white/50">
            {stability.label} · Runway {stability.runwayMonths} mo
          </p>

          <div className="mt-4 h-2.5 w-full rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-white transition-all"
              style={{ width: `${stability.score}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">Goal Momentum</p>

            <h3 className="mt-1 text-2xl font-semibold">
              Your progress in motion
            </h3>
          </div>
        </div>

        <div className="mt-6">
          <GoalsList />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <RiskInsightCard />

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Smart Insight</p>

          <h3 className="mt-3 text-xl font-semibold">
            Your system is learning your rhythm
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/60">
            Semakin sering kamu menyelesaikan action dan mencatat progress,
            sistem akan semakin akurat membaca arah goal dan kondisi hidupmu.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/50">Money Activity</p>

        <h3 className="mt-2 text-2xl font-semibold">Latest Transactions</h3>

        <div className="mt-6">
          <TransactionsList />
        </div>
      </section>
    </main>
  )
}