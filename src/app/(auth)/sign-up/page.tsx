"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"


export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setMessage("Akun berhasil dibuat. Silakan cek email kamu untuk verifikasi.")
      setTimeout(() => {
        router.push("/sign-in")
      }, 1500)
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="mb-6">
          <p className="text-sm text-white/60">Life Control Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-white/60">
            Mulai bangun life operating system kamu.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              placeholder="Ajib Kurniawan"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {message && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          Sudah punya akun?{" "}
          <Link href="/sign-in" className="text-white underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}