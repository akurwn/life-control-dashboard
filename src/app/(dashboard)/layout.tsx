import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import BottomNav from "@/components/navigation/bottom-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_25%),#020617] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">
              Life Control System
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Welcome back, {displayName}
            </h1>
          </div>
        </header>

        {children}
      </div>

      <BottomNav />
    </div>
  )
}