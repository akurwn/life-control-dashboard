import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { calculate7DayConsistency } from "@/lib/calculations/consistency"
import { calculateTrajectory } from "@/lib/calculations/trajectory"
import { calculateStability } from "@/lib/calculations/stability"
import TodayActions from "@/components/dashboard/today-actions"
import ConsistencyCard from "@/components/dashboard/consistency-card"
import RiskInsightCard from "@/components/dashboard/risk-insight-card"

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

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

  const [goalsResult, todayLogsResult, weeklyLogsResult, actionsResult, transactionsResult] =
    await Promise.all([
      supabase
        .from("goals")
        .select("id, target_amount, current_amount, status", { count: "exact" })
        .eq("user_id", user.id),

      supabase
        .from("action_logs")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("completed_date", today),

      supabase
        .from("action_logs")
        .select("completed_date")
        .eq("user_id", user.id)
        .gte("completed_date", start),

      supabase
        .from("goal_actions")
        .select("id", { count: "exact" })
        .eq("user_id", user.id),

      supabase
        .from("transactions")
        .select("type, amount")
        .eq("user_id", user.id),
    ])

  const goals = goalsResult.data || []
  const completedToday = todayLogsResult.count || 0
  const totalActions = actionsResult.count || 0
  const transactions = transactionsResult.data || []

  const completedDates = (weeklyLogsResult.data || []).map(
    (log) => log.completed_date
  )

  const consistencyResult = calculate7DayConsistency(completedDates)

  const totalTarget = goals.reduce(
    (sum, goal) => sum + Number(goal.target_amount || 0),
    0
  )

  const totalCurrent = goals.reduce(
    (sum, goal) => sum + Number(goal.current_amount || 0),
    0
  )

  const overallGoalProgress =
    totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

  const activeGoals = goals.filter((goal) => goal.status !== "completed").length

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

  const lifeScore = Math.min(
    100,
    Math.round(
      consistencyResult.consistency * 0.35 +
        overallGoalProgress * 0.3 +
        stability.score * 0.25 +
        Math.min(activeGoals * 5, 10)
    )
  )

  const trajectory = calculateTrajectory({
    consistency: consistencyResult.consistency,
    goalProgress: overallGoalProgress,
    completedToday,
  })

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "there"

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-white/40">
              {getGreeting()}, {displayName}
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              {trajectory.label}
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
              {trajectory.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:min-w-[360px]">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                Life Score
              </p>
              <p className="mt-3 text-4xl font-semibold">{lifeScore}</p>
              <p className="mt-2 text-sm text-white/50">Overall direction</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                Done Today
              </p>
              <p className="mt-3 text-4xl font-semibold">{completedToday}</p>
              <p className="mt-2 text-sm text-white/50">Actions completed</p>
            </div>
          </div>
        </div>
      </section>

      <TodayActions />

      <section className="grid gap-4 xl:grid-cols-4">
        <ConsistencyCard />

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Goal Momentum</p>

          <div className="mt-4 flex items-end gap-2">
            <h3 className="text-4xl font-semibold">{overallGoalProgress}%</h3>
            <p className="mb-1 text-sm text-white/40">overall progress</p>
          </div>

          <p className="mt-3 text-sm leading-6 text-white/55">
            Terkumpul / tercapai Rp {totalCurrent.toLocaleString("id-ID")} dari Rp{" "}
            {totalTarget.toLocaleString("id-ID")}
          </p>

          <div className="mt-5 h-2.5 w-full rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-white transition-all"
              style={{ width: `${Math.min(overallGoalProgress, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Financial Stability</p>

          <div className="mt-4 flex items-end gap-2">
            <h3 className="text-4xl font-semibold">{stability.score}</h3>
            <p className="mb-1 text-sm text-white/40">{stability.label}</p>
          </div>

          <p className="mt-3 text-sm leading-6 text-white/55">
            Runway {stability.runwayMonths} bulan dengan cashflow yang tercatat saat ini.
          </p>

          <div className="mt-5 h-2.5 w-full rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-white transition-all"
              style={{ width: `${stability.score}%` }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">System Snapshot</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-white/55">Active goals</span>
              <span className="text-lg font-semibold">{activeGoals}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-white/55">All goals</span>
              <span className="text-lg font-semibold">{goals.length}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-white/55">Available actions</span>
              <span className="text-lg font-semibold">{totalActions}</span>
            </div>
          </div>
        </div>
      </section>

      <RiskInsightCard />
    </main>
  )
}