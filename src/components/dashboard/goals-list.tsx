import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import AddSavingForm from "@/components/dashboard/add-saving-form"
import ProbabilityCard from "@/components/dashboard/probability-card"
import ActionsList from "@/components/dashboard/actions-list"

export default async function GoalsList() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (!goals || goals.length === 0) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
        <p className="text-sm text-white/60">Belum ada goal.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {goals.map((goal) => {
        const currentAmount = Number(goal.current_amount ?? 0)
        const targetAmount = Number(goal.target_amount ?? 0)

        const progress =
          targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0

        const progressWidth = Math.min(progress, 100)

        return (
          <div
            key={goal.id}
            className="rounded-[28px] border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/45">Goal</p>

                <Link href={`/goals/${goal.id}`} className="block">
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-white transition hover:opacity-80">
                    {goal.title}
                  </h3>
                </Link>

                <Link
                  href={`/goals/${goal.id}`}
                  className="mt-3 inline-flex text-sm text-white/50 underline underline-offset-4 hover:text-white"
                >
                  View details
                </Link>

                {goal.status && (
                  <div className="mt-3 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/55">
                    {goal.status}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-white/60">
              <p>Target: Rp {targetAmount.toLocaleString("id-ID")}</p>
              <p>Terkumpul: Rp {currentAmount.toLocaleString("id-ID")}</p>
              {goal.deadline && <p>Deadline: {goal.deadline}</p>}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm text-white/55">
                <span>Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-white/10">
                <div
                  className="h-2.5 rounded-full bg-white transition-all"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>

            <div className="mt-5">
              <ProbabilityCard
                title={goal.title}
                targetAmount={targetAmount}
                currentAmount={currentAmount}
                deadline={goal.deadline}
              />
            </div>

            <div className="mt-5">
              <AddSavingForm
                goalId={goal.id}
                currentAmount={currentAmount}
              />
            </div>

            <div className="mt-5">
              <ActionsList goalId={goal.id} />
            </div>
          </div>
        )
      })}
    </div>
  )
}