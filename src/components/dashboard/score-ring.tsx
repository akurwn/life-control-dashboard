type ScoreRingProps = {
  value: number
  label?: string
}

export default function ScoreRing({
  value,
  label = "Life Score",
}: ScoreRingProps) {
  const safeValue = Math.max(0, Math.min(100, value))
  const radius = 52
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset =
    circumference - (safeValue / 100) * circumference

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32">
        <svg height="128" width="128" className="-rotate-90">
          <defs>
            <linearGradient id="lifeScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          <circle
            stroke="rgba(255,255,255,0.10)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="64"
            cy="64"
          />
          <circle
            stroke="url(#lifeScoreGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx="64"
            cy="64"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-white">{safeValue}</span>
          <span className="text-xs text-white/45">/ 100</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-cyan-300/70">{label}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          System health
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">
          Score ini merangkum progress goal, konsistensi, stabilitas finansial,
          dan action hari ini.
        </p>
      </div>
    </div>
  )
}