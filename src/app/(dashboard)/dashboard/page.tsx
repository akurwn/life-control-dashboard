import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

import TodayActions from "@/components/dashboard/today-actions"
import GoalsList from "@/components/dashboard/goals-list"
import TransactionsList from "@/components/dashboard/transactions-list"
import RiskInsightCard from "@/components/dashboard/risk-insight-card"
import ScoreRing from "@/components/dashboard/score-ring"
import AppCard from "@/components/ui/app-card"

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
        .select("type, amount, category, note, transaction_date, created_at, id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),

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
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AppCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_35%)]" />
          <div className="relative">
            <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
              Today Focus
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              What moves your life forward today
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              Sistem memilih action paling penting untuk menjaga momentum goal,
              ritme hidup, dan arah progress kamu.
            </p>

            <div className="mt-6">
              <TodayActions />
            </div>
          </div>
        </AppCard>

        <AppCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.10),transparent_35%)]" />
          <div className="relative">
            <ScoreRing value={lifeScore.score} />
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-violet-300/80">{lifeScore.label}</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {lifeScore.insight}
              </p>
            </div>
          </div>
        </AppCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AppCard>
          <p className="text-sm text-cyan-300/70">Goal Progress</p>

          <div className="mt-3 flex items-end gap-2">
            <h3 className="text-4xl font-semibold">{goalProgress}%</h3>
            <p className="mb-1 text-sm text-white/40">overall</p>
          </div>

          <p className="mt-3 text-sm text-white/55">
            Rp {totalCurrent.toLocaleString("id-ID")} / Rp{" "}
            {totalTarget.toLocaleString("id-ID")}
          </p>

          <div className="mt-4 h-2.5 w-full rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
        </AppCard>

        <AppCard>
          <p className="text-sm text-emerald-300/70">Consistency</p>

          <div className="mt-3 flex items-end gap-2">
            <h3 className="text-4xl font-semibold">
              {consistency.consistency}%
            </h3>
            <p className="mb-1 text-sm text-white/40">7-day</p>
          </div>

          <p className="mt-3 text-sm text-white/55">
            Active on {consistency.activeDays} dari {consistency.totalDays} hari
            terakhir.
          </p>

          <div className="mt-4 h-2.5 w-full rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
              style={{ width: `${consistency.consistency}%` }}
            />
          </div>
        </AppCard>

        <AppCard>
          <p className="text-sm text-amber-300/70">Money Status</p>

          <div className="mt-3 flex items-end gap-2">
            <h3 className="text-4xl font-semibold">{stability.score}</h3>
            <p className="mb-1 text-sm text-white/40">{stability.label}</p>
          </div>

          <p className="mt-3 text-sm text-white/55">
            Runway {stability.runwayMonths} mo
          </p>

          <div className="mt-4 h-2.5 w-full rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all"
              style={{ width: `${stability.score}%` }}
            />
          </div>
        </AppCard>
      </section>

      <AppCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-violet-300/70">Goal Momentum</p>
            <h3 className="mt-1 text-2xl font-semibold">
              Your progress in motion
            </h3>
          </div>
        </div>

        <div className="mt-6">
          <GoalsList />
        </div>
      </AppCard>

      <section className="grid gap-4 md:grid-cols-2">
        <RiskInsightCard />

        <AppCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_35%)]" />
          <div className="relative">
            <p className="text-sm text-violet-300/70">Smart Insight</p>

            <h3 className="mt-3 text-xl font-semibold">
              Your system is learning your rhythm
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Semakin sering kamu menyelesaikan action dan mencatat progress,
              sistem akan semakin akurat membaca arah goal dan kondisi hidupmu.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/45">Completed today</p>
                <p className="mt-2 text-2xl font-semibold">{completedToday}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/45">Active goals</p>
                <p className="mt-2 text-2xl font-semibold">{goals.length}</p>
              </div>
            </div>
          </div>
        </AppCard>
      </section>

      <AppCard>
        <p className="text-sm text-cyan-300/70">Money Activity</p>

        <h3 className="mt-2 text-2xl font-semibold">Latest Transactions</h3>

        <div className="mt-6">
          <TransactionsList />
        </div>
      </AppCard>
    </main>
  )
}