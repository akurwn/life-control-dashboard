"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

type CompleteActionButtonProps = {
  actionId: string
  actionType: "check" | "number"
  completedToday: boolean
}

export default function CompleteActionButton({
  actionId,
  actionType,
  completedToday,
}: CompleteActionButtonProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState("")

  async function handleComplete() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const payload = {
      user_id: user.id,
      action_id: actionId,
      completed_date: new Date().toISOString().slice(0, 10),
      value: actionType === "number" ? Number(value || 0) : 1,
    }

    const { error } = await supabase.from("action_logs").insert(payload)

    if (!error) {
      window.location.reload()
    }

    setLoading(false)
  }

  if (completedToday) {
    return (
      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
        Done today
      </span>
    )
  }

  if (actionType === "number") {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
        />
        <button
          onClick={handleComplete}
          disabled={loading}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/5 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Log"}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/5 disabled:opacity-50"
    >
      {loading ? "Saving..." : "Complete"}
    </button>
  )
}