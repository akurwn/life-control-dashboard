export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-6 shadow-lg ${className}`}
    >
      {children}
    </div>
  )
}