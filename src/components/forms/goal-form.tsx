"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function GoalForm() {
  const supabase = createClient()

  const [title, setTitle] = useState("")
  const [target, setTarget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("goals").insert({
      user_id: user.id,
      title,
      target_amount: Number(target),
      deadline,
    })

    setTitle("")
    setTarget("")
    setDeadline("")
    setLoading(false)

    alert("Goal created")
  }

  return (
    <form onSubmit={handleCreateGoal} className="space-y-4">
      <input
        type="text"
        placeholder="Goal name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl bg-white/5 p-3"
      />

      <input
        type="number"
        placeholder="Target amount"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="w-full rounded-xl bg-white/5 p-3"
      />

      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="w-full rounded-xl bg-white/5 p-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-white px-4 py-2 text-black"
      >
        {loading ? "Saving..." : "Create Goal"}
      </button>
    </form>
  )
}