"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

type AddSavingFormProps = {
  goalId: string
  currentAmount: number
}

export default function AddSavingForm({
  goalId,
  currentAmount,
}: AddSavingFormProps) {
  const supabase = createClient()

  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleAddSaving(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      setLoading(false)
      return
    }

    const newAmount = currentAmount + numericAmount

    const { error } = await supabase
      .from("goals")
      .update({
        current_amount: newAmount,
      })
      .eq("id", goalId)

    if (!error) {
      setAmount("")
      setOpen(false)
      window.location.reload()
    }

    setLoading(false)
  }

  return (
    <div className="mt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
        >
          + Tambah tabungan
        </button>
      ) : (
        <form onSubmit={handleAddSaving} className="space-y-3">
          <input
            type="number"
            placeholder="Nominal tabungan"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            required
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}