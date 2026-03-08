"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function TransactionForm() {
  const supabase = createClient()

  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [note, setNote] = useState("")
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      setLoading(false)
      return
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type,
      amount: numericAmount,
      category,
      note,
      transaction_date: transactionDate,
    })

    if (!error) {
      setType("expense")
      setAmount("")
      setCategory("")
      setNote("")
      setTransactionDate(new Date().toISOString().slice(0, 10))
      window.location.reload()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-white/60">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/60">Amount</label>
          <input
            type="number"
            placeholder="500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-white/60">Category</label>
          <input
            type="text"
            placeholder="Food, Salary, Transport"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/60">Date</label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/60">Note</label>
        <textarea
          placeholder="Optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  )
}