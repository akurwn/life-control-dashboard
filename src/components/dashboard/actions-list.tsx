import { createClient } from "@/lib/supabase/server"

type ActionsListProps = {
  goalId: string
}

type GoalAction = {
  id: string
  title: string
  action_type: string | null
  target_value: number | null
  unit: string | null
}

export default async function ActionsList({
  goalId,
}: ActionsListProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: actions } = await supabase
    .from("goal_actions")
    .select("id, title, action_type, target_value, unit")
    .eq("user_id", user.id)
    .eq("goal_id", goalId)
    .order("created_at", { ascending: false })

  const typedActions: GoalAction[] = (actions || []).map((action) => ({
    id: action.id,
    title: action.title,
    action_type: action.action_type,
    target_value: action.target_value,
    unit: action.unit,
  }))

  return (
    <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white/90">All Actions</h4>
        <p className="mt-1 text-xs text-white/55">
          Action yang mendukung goal ini.
        </p>
      </div>

      <div className="space-y-3">
        {typedActions.length === 0 ? (
          <p className="text-sm text-white/55">
            Belum ada action untuk goal ini.
          </p>
        ) : (
          typedActions.map((action) => (
            <div
              key={action.id}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <p className="font-medium text-white">{action.title}</p>
              <p className="mt-1 text-xs text-white/55">
                {action.action_type === "number"
                  ? `Target: ${Number(action.target_value || 0)} ${action.unit || ""}`
                  : "Checklist action"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}