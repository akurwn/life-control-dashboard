"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      Sign out
    </button>
  )
}