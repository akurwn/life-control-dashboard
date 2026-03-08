import { createClient } from "@/lib/supabase/server"
import { calculate7DayConsistency } from "@/lib/calculations/consistency"

export default async function ConsistencyCard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 6)

  const start = startDate.toISOString().slice(0, 10)

  const { data: logs } = await supabase
    .from("action_logs")
    .select("completed_date")
    .eq("user_id", user.id)
    .gte("completed_date", start)

  const completedDates = (logs || []).map((log) => log.completed_date)
  const result = calculate7DayConsistency(completedDates)

  let status = "Building"
  if (result.consistency >= 80) status = "Strong"
  else if (result.consistency >= 50) status = "Stable"

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-white/50">7-Day Consistency</p>

      <div className="mt-4 flex items-end gap-2">
        <h3 className="text-4xl font-semibold">{result.consistency}%</h3>
        <p className="mb-1 text-sm text-white/40">{status}</p>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/55">
        Active on {result.activeDays} dari {result.totalDays} hari terakhir
      </p>

      <div className="mt-5 h-2.5 w-full rounded-full bg-white/10">
        <div
          className="h-2.5 rounded-full bg-white transition-all"
          style={{ width: `${result.consistency}%` }}
        />
      </div>
    </div>
  )
}