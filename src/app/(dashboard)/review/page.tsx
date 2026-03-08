import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { calculateWeeklyReview } from "@/lib/calculations/weekly-review"
import { buildWeeklyActivityData } from "@/lib/calculations/weekly-chart"
import WeeklyActivityChart from "@/components/dashboard/weekly-activity-chart"

export default async function ReviewPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 6)

  const start = startDate.toISOString().slice(0, 10)

  const [goalsResult, actionsResult, logsResult] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, target_amount, current_amount")
      .eq("user_id", user.id),

    supabase
      .from("goal_actions")
      .select("id, goal_id")
      .eq("user_id", user.id),

    supabase
      .from("action_logs")
      .select("action_id, completed_date")
      .eq("user_id", user.id)
      .gte("completed_date", start),
  ])

  const goals = goalsResult.data || []
  const actions = actionsResult.data || []
  const logs = logsResult.data || []

  const review = calculateWeeklyReview({
    goals,
    actions,
    logs,
  })

  const chartData = buildWeeklyActivityData(logs)

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/45">Weekly Review</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Lihat bagaimana minggu kamu bergerak
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Ringkasan ini membantu kamu membaca ritme, momentum, dan goal mana yang paling kuat atau mulai tertinggal.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Completed Actions</p>
          <h3 className="mt-3 text-4xl font-semibold">
            {review.totalCompletedActions}
          </h3>
          <p className="mt-2 text-sm text-white/55">
            Jumlah action yang berhasil kamu log minggu ini
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Active Days</p>
          <h3 className="mt-3 text-4xl font-semibold">
            {review.activeDays}/7
          </h3>
          <p className="mt-2 text-sm text-white/55">
            Hari aktif dalam 7 hari terakhir
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Consistency</p>
          <h3 className="mt-3 text-4xl font-semibold">
            {review.consistency}%
          </h3>
          <p className="mt-2 text-sm text-white/55">
            Seberapa stabil ritme kamu minggu ini
          </p>
        </div>
      </section>

      <WeeklyActivityChart data={chartData} />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Strongest Goal</p>
          <h3 className="mt-3 text-2xl font-semibold">
            {review.strongestGoalTitle || "Belum ada data"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Goal ini menunjukkan kombinasi progress dan activity paling kuat minggu ini.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Needs Attention</p>
          <h3 className="mt-3 text-2xl font-semibold">
            {review.weakestGoalTitle || "Belum ada data"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Goal ini paling layak kamu dorong lagi supaya tidak kehilangan momentum.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Momentum</p>
          <h3 className="mt-3 text-3xl font-semibold">{review.momentum}</h3>
          <p className="mt-3 text-sm leading-6 text-white/60">
            {review.momentum === "Strong" &&
              "Minggu ini ritme kamu kuat. Progress terasa hidup dan bergerak."}
            {review.momentum === "Stable" &&
              "Minggu ini cukup sehat, tapi masih ada ruang untuk memperkuat konsistensi."}
            {review.momentum === "Weak" &&
              "Minggu ini masih cenderung lemah. Kamu butuh start kecil yang lebih rutin."}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Recommendation for Next Week</p>
          <h3 className="mt-3 text-2xl font-semibold">What to do next</h3>
          <p className="mt-3 text-sm leading-7 text-white/60">
            {review.recommendation}
          </p>
        </div>
      </section>
    </main>
  )
}