import { createClient } from "@/lib/supabase/server"

type Goal = {
  id: string
  title: string
  target_amount: number | null
  current_amount: number | null
  deadline: string | null
}

type Action = {
  id: string
  goal_id: string
  title: string
}

type ActionLog = {
  action_id: string
  completed_date: string
}

type ScoredAction = Action & {
  goalTitle: string
  priority: number
}

function daysUntil(dateString: string | null) {
  if (!dateString) return 999

  const today = new Date()
  const target = new Date(dateString)

  const ms = target.getTime() - today.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function goalProgress(goal: Goal) {
  const target = Number(goal.target_amount || 0)
  const current = Number(goal.current_amount || 0)

  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

function calculatePriority(action: Action, goal: Goal, logs: ActionLog[]) {
  let score = 0

  const progress = goalProgress(goal)
  const daysLeft = daysUntil(goal.deadline)

  if (progress < 30) score += 40
  else if (progress < 60) score += 20

  if (daysLeft <= 7) score += 40
  else if (daysLeft <= 30) score += 25
  else if (daysLeft <= 90) score += 10

  const lastLog = logs
    .filter((log) => log.action_id === action.id)
    .sort((a, b) => b.completed_date.localeCompare(a.completed_date))[0]

  if (!lastLog) {
    score += 20
  } else {
    const lastDate = new Date(lastLog.completed_date)
    const today = new Date()

    const diff =
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)

    if (diff > 7) score += 25
    else if (diff > 3) score += 10
  }

  return score
}

export default async function TodayActions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [goalsResult, actionsResult, logsResult] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, target_amount, current_amount, deadline")
      .eq("user_id", user.id),

    supabase
      .from("goal_actions")
      .select("id, goal_id, title")
      .eq("user_id", user.id),

    supabase
      .from("action_logs")
      .select("action_id, completed_date")
      .eq("user_id", user.id),
  ])

  const goals: Goal[] = (goalsResult.data || []).map((goal) => ({
    id: goal.id,
    title: goal.title,
    target_amount: goal.target_amount,
    current_amount: goal.current_amount,
    deadline: goal.deadline,
  }))

  const actions: Action[] = (actionsResult.data || []).map((action) => ({
    id: action.id,
    goal_id: action.goal_id,
    title: action.title,
  }))

  const logs: ActionLog[] = (logsResult.data || []).map((log) => ({
    action_id: log.action_id,
    completed_date: log.completed_date,
  }))

  const scored: ScoredAction[] = actions
    .map((action) => {
      const goal = goals.find((g) => g.id === action.goal_id)

      if (!goal) return null

      const score = calculatePriority(action, goal, logs)

      return {
        ...action,
        goalTitle: goal.title,
        priority: score,
      }
    })
    .filter((item): item is ScoredAction => item !== null)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4)

  if (scored.length === 0) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/50">Today Focus</p>
        <p className="mt-4 text-sm text-white/60">
          Belum ada action yang tersedia. Tambahkan action pada goal untuk mulai membangun momentum.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <p className="text-sm text-white/45">Today Focus</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          Best actions to move today
        </h3>
        <p className="mt-2 text-sm text-white/60">
          Sistem memilih action dengan dampak terbesar berdasarkan deadline goal, progress, dan aktivitas terakhir.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {scored.map((action) => (
          <div
            key={action.id}
            className="rounded-3xl border border-white/10 bg-black/20 p-5"
          >
            <p className="text-sm font-medium text-white">{action.title}</p>
            <p className="mt-2 text-xs text-white/50">
              Goal: {action.goalTitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}