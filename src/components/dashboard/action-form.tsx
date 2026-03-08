"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

type ActionFormProps = {
  goalId: string
}

export default function ActionForm({ goalId }: ActionFormProps) {
  const supabase = createClient()

  const [title, setTitle] = useState("")
  const [actionType, setActionType] = useState<"check" | "number">("check")
  const [targetValue, setTargetValue] = useState("")
  const [unit, setUnit] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreateAction(e: React.FormEvent) {
    e.preventDefault()
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
      goal_id: goalId,
      title,
      action_type: actionType,
      target_value: actionType === "number" ? Number(targetValue || 0) : null,
      unit: actionType === "number" ? unit : null,
    }

    const { error } = await supabase.from("goal_actions").insert(payload)

    if (!error) {
      setTitle("")
      setActionType("check")
      setTargetValue("")
      setUnit("")
      window.location.reload()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleCreateAction} className="mt-4 space-y-3">
      <input
        type="text"
        placeholder="Contoh: Study UI design"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        required
      />

      <select
        value={actionType}
        onChange={(e) => setActionType(e.target.value as "check" | "number")}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
      >
        <option value="check">Checklist action</option>
        <option value="number">Numeric action</option>
      </select>

      {actionType === "number" && (
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="number"
            placeholder="Target value"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Unit (min, cv, k, dll)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Action"}
      </button>
    </form>
  )
}