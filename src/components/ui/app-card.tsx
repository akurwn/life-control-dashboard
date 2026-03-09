type AppCardProps = {
  children: React.ReactNode
  className?: string
}

export default function AppCard({
  children,
  className = "",
}: AppCardProps) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  )
}