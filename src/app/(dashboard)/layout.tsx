import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppSidebar from "@/components/shared/app-sidebar"
import SignOutButton from "@/components/shared/sign-out-button"
import BottomNav from "@/components/navigation/bottom-nav"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="flex min-h-screen flex-col md:flex-row">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/75 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
              <div>
                <p className="text-sm text-white/40">Life Control Dashboard</p>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">
                  Welcome back, {displayName}
                </h1>
              </div>

              <SignOutButton />
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-6 md:pb-8">
            {children}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}