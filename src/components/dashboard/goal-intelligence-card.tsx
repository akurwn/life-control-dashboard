import { createClient } from "@/lib/supabase/server"
import { calculateGoalIntelligence } from "@/lib/calculations/goal-intelligence"

type GoalIntelligenceCardProps = {
  goalId: string
}

export default async function GoalIntelligenceCard({
  goalId,
}: GoalIntelligenceCardProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: actions } = await supabase
    .from("goal_actions")
    .select("id")
    .eq("user_id", user.id)
    .eq("goal_id", goalId)

  const actionIds = (actions || []).map((action) => action.id)

  if (actionIds.length === 0) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/45">Goal Intelligence</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          Belum ada activity data
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Tambahkan actions dan mulai log progress supaya sistem bisa membaca momentum goal ini.
        </p>
      </section>
    )
  }

  const { data: logs } = await supabase
    .from("action_logs")
    .select("completed_date")
    .eq("user_id", user.id)
    .in("action_id", actionIds)

  const result = calculateGoalIntelligence(logs || [])

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <p className="text-sm text-white/45">Goal Intelligence</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          Ritme progress goal ini
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Baca momentum goal berdasarkan action yang benar-benar kamu jalankan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/50">7-Day Completed</p>
          <p className="mt-3 text-3xl font-semibold">{result.weeklyCompleted}</p>
          <p className="mt-2 text-sm text-white/55">Jumlah log 7 hari terakhir</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/50">Active Days</p>
          <p className="mt-3 text-3xl font-semibold">{result.activeDays}/7</p>
          <p className="mt-2 text-sm text-white/55">Hari aktif dalam 7 hari terakhir</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/50">Current Streak</p>
          <p className="mt-3 text-3xl font-semibold">{result.streak}</p>
          <p className="mt-2 text-sm text-white/55">Hari berturut-turut aktif</p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
        <p className="text-sm text-white/50">Momentum</p>
        <h4 className="mt-2 text-2xl font-semibold">{result.momentum}</h4>
        <p className="mt-2 text-sm leading-6 text-white/60">
          {result.momentum === "Strong" &&
            "Goal ini sedang bergerak dengan ritme yang kuat."}
          {result.momentum === "Stable" &&
            "Goal ini cukup hidup, tapi masih bisa didorong lebih konsisten."}
          {result.momentum === "Weak" &&
            "Goal ini mulai stagnan dan butuh action yang lebih rutin."}
        </p>
      </div>
    </section>
  )
}