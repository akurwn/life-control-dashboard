import { createClient } from "@/lib/supabase/server"
import CompleteActionButton from "@/components/dashboard/complete-action-button"

export default async function ActionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const today = new Date().toISOString().slice(0, 10)

  const { data: actions } = await supabase
    .from("goal_actions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: todayLogs } = await supabase
    .from("action_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("completed_date", today)

  const completedIds = new Set((todayLogs || []).map((log) => log.action_id))

  const totalActions = actions?.length || 0
  const completedToday = completedIds.size
  const pendingToday = Math.max(totalActions - completedToday, 0)

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/45">Actions</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Lapisan eksekusi harianmu
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Semua action dari seluruh goal kamu dikumpulkan di sini supaya kamu bisa fokus ke hal yang benar-benar perlu dikerjakan.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">All Actions</p>
          <h3 className="mt-3 text-4xl font-semibold">{totalActions}</h3>
          <p className="mt-2 text-sm text-white/55">Semua action yang tersedia</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Done Today</p>
          <h3 className="mt-3 text-4xl font-semibold">{completedToday}</h3>
          <p className="mt-2 text-sm text-white/55">Action yang sudah diselesaikan</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Pending</p>
          <h3 className="mt-3 text-4xl font-semibold">{pendingToday}</h3>
          <p className="mt-2 text-sm text-white/55">Masih bisa kamu dorong hari ini</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <p className="text-sm text-white/45">Action List</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            Semua action aktif
          </h3>
        </div>

        <div className="space-y-3">
          {!actions || actions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-sm text-white/60">Belum ada action.</p>
            </div>
          ) : (
            actions.map((action) => {
              const completedToday = completedIds.has(action.id)

              return (
                <div
                  key={action.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                >
                  <div>
                    <p className="font-medium text-white">{action.title}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {action.action_type === "check"
                        ? "Checklist action"
                        : `Target: ${Number(action.target_value || 0)} ${action.unit || ""}`}
                    </p>
                  </div>

                  <CompleteActionButton
                    actionId={action.id}
                    actionType={action.action_type}
                    completedToday={completedToday}
                  />
                </div>
              )
            })
          )}
        </div>
      </section>
    </main>
  )
}