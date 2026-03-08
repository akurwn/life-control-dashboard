import { calculateGoalProbability } from "@/lib/calculations/probability"

type ProbabilityCardProps = {
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
}

export default function ProbabilityCard({
  title,
  targetAmount,
  currentAmount,
  deadline,
}: ProbabilityCardProps) {
  if (!deadline) {
    return (
      <div className="mt-4 rounded-3xl border border-cyan-400/10 bg-cyan-400/5 p-4">
        <p className="text-sm text-white/70">
          Tambahkan deadline untuk melihat chance to reach goal.
        </p>
      </div>
    )
  }

  const result = calculateGoalProbability({
    targetAmount,
    currentAmount,
    deadline,
  })

  return (
    <div className="mt-4 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-transparent p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">Chance to Reach Goal</p>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
          Smart Insight
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <h4 className="text-3xl font-semibold text-cyan-200">
          {result.probability}%
        </h4>
        <p className="mb-1 text-sm text-white/50">{title}</p>
      </div>

      <div className="mt-4 space-y-2 text-sm text-white/70">
        <p>Butuh tabungan sekitar Rp {result.requiredDaily.toLocaleString("id-ID")} / hari</p>
        <p>
          Estimasi waktu tercapai:{" "}
          {result.estimatedDaysNeeded
            ? `${result.estimatedDaysNeeded} hari`
            : "Belum cukup data"}
        </p>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/75">{result.insight}</p>
    </div>
  )
}