import GoalForm from "@/components/forms/goal-form"
import GoalsList from "@/components/dashboard/goals-list"

export default function GoalsPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/45">Goals</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Semua arah yang sedang kamu kejar
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Kelola target hidupmu, lihat progress, tambahkan actions, dan pantau peluang tercapainya.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_1.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <p className="text-sm text-white/45">Create New Goal</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              Tambah goal baru
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Masukkan goal yang benar-benar mendorong hidupmu ke arah yang kamu mau.
            </p>
          </div>

          <GoalForm />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <p className="text-sm text-white/45">Goal Library</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              Progress semua goal
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Lihat perkembangan setiap goal, actions pendukung, dan insight peluang tercapai.
            </p>
          </div>

          <GoalsList />
        </div>
      </section>
    </main>
  )
}