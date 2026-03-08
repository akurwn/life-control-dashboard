import { createClient } from "@/lib/supabase/server"

type GoalHistoryProps = {
  goalId: string
}

export default async function GoalHistory({ goalId }: GoalHistoryProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: actions } = await supabase
    .from("goal_actions")
    .select("id, title, action_type, unit")
    .eq("user_id", user.id)
    .eq("goal_id", goalId)

  const actionMap = new Map(
    (actions || []).map((action) => [action.id, action])
  )

  const actionIds = (actions || []).map((action) => action.id)

  if (actionIds.length === 0) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/60">Belum ada history action.</p>
      </div>
    )
  }

  const { data: logs } = await supabase
    .from("action_logs")
    .select("*")
    .eq("user_id", user.id)
    .in("action_id", actionIds)
    .order("completed_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/60">Belum ada history action.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <p className="text-sm text-white/45">History</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          Riwayat progress goal ini
        </h3>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          const action = actionMap.get(log.action_id)

          return (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
            >
              <div>
                <p className="font-medium text-white">
                  {action?.title || "Unknown action"}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {log.completed_date}
                </p>
              </div>

              <div className="text-sm text-white/60">
                {action?.action_type === "number"
                  ? `${Number(log.value || 0)} ${action?.unit || ""}`
                  : "Completed"}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}