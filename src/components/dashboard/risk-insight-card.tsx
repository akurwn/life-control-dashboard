import { createClient } from "@/lib/supabase/server"
import { calculateStability } from "@/lib/calculations/stability"
import { calculate7DayConsistency } from "@/lib/calculations/consistency"
import { calculateRiskInsight } from "@/lib/calculations/risk-insight"
import AppCard from "@/components/ui/app-card"

export default async function RiskInsightCard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 6)
  const start = startDate.toISOString().slice(0, 10)

  const [transactionsResult, goalsResult, logsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", user.id),

    supabase
      .from("goals")
      .select("id, title, target_amount, current_amount, deadline")
      .eq("user_id", user.id),

    supabase
      .from("action_logs")
      .select("completed_date")
      .eq("user_id", user.id)
      .gte("completed_date", start),
  ])

  const transactions = transactionsResult.data || []
  const goals = goalsResult.data || []
  const logs = logsResult.data || []

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

  const completedDates = logs.map((log) => log.completed_date)
  const consistency = calculate7DayConsistency(completedDates)

  const insight = calculateRiskInsight({
    stabilityLabel: stability.label,
    consistency: consistency.consistency,
    goals,
  })

  return (
    <AppCard className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.12),transparent_35%)]" />
      <div className="relative">
        <div className="mb-5">
          <p className="text-sm text-amber-300/80">Risk Insight</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            What needs attention right now
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Blok ini membantu kamu melihat risiko terbesar, goal paling rentan,
            dan langkah paling aman minggu ini.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-white/50">Biggest Risk Right Now</p>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {insight.biggestRisk}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-white/50">Most Vulnerable Goal</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {insight.vulnerableGoalTitle || "No clear risk detected"}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Goal ini paling layak kamu jaga agar tidak kehilangan momentum atau tertunda.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-white/50">Safest Move This Week</p>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {insight.safestMove}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-white/50">Recommended Focus</p>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {insight.recommendedFocus}
            </p>
          </div>
        </div>
      </div>
    </AppCard>
  )
}