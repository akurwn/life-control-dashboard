import { createClient } from "@/lib/supabase/server"

export default async function TransactionsList() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
        <p className="text-sm text-white/60">Belum ada transaksi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
        >
          <div>
            <p className="font-medium text-white">
              {transaction.category || "Uncategorized"}
            </p>
            <p className="mt-1 text-xs text-white/50">
              {transaction.transaction_date}
              {transaction.note ? ` • ${transaction.note}` : ""}
            </p>
          </div>

          <div className="text-right">
            <p
              className={`font-medium ${
                transaction.type === "income" ? "text-white" : "text-white/80"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}Rp{" "}
              {Number(transaction.amount).toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-xs text-white/45">{transaction.type}</p>
          </div>
        </div>
      ))}
    </div>
  )
}