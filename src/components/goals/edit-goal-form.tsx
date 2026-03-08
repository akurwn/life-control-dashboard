"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Goal = {
  id: string
  title: string
  target_amount: number | null
  current_amount: number | null
  deadline: string | null
}

export default function EditGoalForm({ goal }: { goal: Goal }) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(goal.title)
  const [target, setTarget] = useState(goal.target_amount || 0)

  async function updateGoal(e: React.FormEvent) {
    e.preventDefault()

    await supabase
      .from("goals")
      .update({
        title,
        target_amount: target,
      })
      .eq("id", goal.id)

    router.refresh()
  }

  return (
    <form onSubmit={updateGoal} className="space-y-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl bg-black/30 p-3"
      />

      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="w-full rounded-xl bg-black/30 p-3"
      />

      <button className="rounded-xl bg-white px-4 py-2 text-black">
        Save
      </button>
    </form>
  )
}