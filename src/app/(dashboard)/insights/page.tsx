import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { calculate7DayConsistency } from "@/lib/calculations/consistency"
import { calculateTrajectory } from "@/lib/calculations/trajectory"
import { buildWeeklyActivityData } from "@/lib/calculations/weekly-chart"
import ConsistencyCard from "@/components/dashboard/consistency-card"
import WeeklyActivityChart from "@/components/dashboard/weekly-activity-chart"

export default async function InsightsPage() {
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

  const [goalsResult, todayLogsResult, weeklyLogsResult] = await Promise.all([
    supabase
      .from("goals")
      .select("target_amount, current_amount")
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
  ])

  const goals = goalsResult.data || []
  const completedToday = todayLogsResult.count || 0
  const weeklyLogs = weeklyLogsResult.data || []

  const completedDates = weeklyLogs.map((log) => log.completed_date)
  const chartData = buildWeeklyActivityData(weeklyLogs)

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

  const trajectory = calculateTrajectory({
    consistency: consistencyResult.consistency,
    goalProgress: overallGoalProgress,
    completedToday,
  })

  const momentum =
    consistencyResult.consistency >= 75
      ? "Strong"
      : consistencyResult.consistency >= 50
      ? "Stable"
      : "Weak"

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/45">Insights</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Lihat pola hidupmu dengan lebih jelas
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Halaman ini membantu kamu membaca momentum, konsistensi, dan arah hidup berdasarkan progress yang sedang kamu bangun.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ConsistencyCard />

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Trajectory</p>
          <h3 className="mt-3 text-3xl font-semibold">{trajectory.label}</h3>
          <p className="mt-3 text-sm leading-6 text-white/60">
            {trajectory.description}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Goal Progress</p>
          <h3 className="mt-3 text-3xl font-semibold">
            {overallGoalProgress}%
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Progress total dari semua goal aktifmu saat ini.
          </p>
        </div>
      </section>

      <WeeklyActivityChart data={chartData} />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Momentum</p>
          <h3 className="mt-3 text-3xl font-semibold">{momentum}</h3>
          <p className="mt-2 text-sm text-white/55">
            Ringkasan energi progress 7 hari terakhir.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Done Today</p>
          <h3 className="mt-3 text-3xl font-semibold">{completedToday}</h3>
          <p className="mt-2 text-sm text-white/55">
            Action yang berhasil kamu selesaikan hari ini.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Progress Value</p>
          <h3 className="mt-3 text-3xl font-semibold">
            Rp {totalCurrent.toLocaleString("id-ID")}
          </h3>
          <p className="mt-2 text-sm text-white/55">
            Total current progress dari seluruh goal terukur.
          </p>
        </div>
      </section>
    </main>
  )
}