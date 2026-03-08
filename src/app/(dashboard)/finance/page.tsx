import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { calculateStability } from "@/lib/calculations/stability"
import TransactionForm from "@/components/forms/transaction-form"
import TransactionsList from "@/components/dashboard/transactions-list"
import DecisionSimulator from "@/components/dashboard/decision-simulator"

export default async function FinancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const [transactionsResult, goalsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", user.id),

    supabase
      .from("goals")
      .select("id, title, target_amount, current_amount, deadline")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  const allTransactions = transactionsResult.data || []
  const goals = goalsResult.data || []

  const totalIncome = allTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const totalExpense = allTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const netFlow = totalIncome - totalExpense

  const stability = calculateStability({
    totalIncome,
    totalExpense,
  })

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/45">Finance</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Money control sebagai support layer
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Keuangan di produk ini berfungsi sebagai fondasi stabilitas untuk goal, keputusan, dan arah hidupmu.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Income</p>
          <h3 className="mt-3 text-3xl font-semibold">
            Rp {totalIncome.toLocaleString("id-ID")}
          </h3>
          <p className="mt-2 text-sm text-white/55">Total pemasukan tercatat</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Expenses</p>
          <h3 className="mt-3 text-3xl font-semibold">
            Rp {totalExpense.toLocaleString("id-ID")}
          </h3>
          <p className="mt-2 text-sm text-white/55">Total pengeluaran tercatat</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Net Flow</p>
          <h3 className="mt-3 text-3xl font-semibold">
            Rp {netFlow.toLocaleString("id-ID")}
          </h3>
          <p className="mt-2 text-sm text-white/55">Selisih income dan expense</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Runway</p>
          <h3 className="mt-3 text-3xl font-semibold">
            {stability.runwayMonths} mo
          </h3>
          <p className="mt-2 text-sm text-white/55">Cadangan napas finansial</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-white/45">Stability Score</p>
            <h3 className="mt-2 text-4xl font-semibold tracking-tight">
              {stability.score}
            </h3>
            <p className="mt-2 text-sm text-white/50">{stability.label}</p>
          </div>

          <div className="lg:max-w-2xl">
            <p className="text-sm leading-7 text-white/60">
              {stability.description}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm text-white/55">
            <span>Financial stability</span>
            <span>{stability.score}/100</span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-white transition-all"
              style={{ width: `${stability.score}%` }}
            />
          </div>
        </div>
      </section>

      <DecisionSimulator
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        goals={goals}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <p className="text-sm text-white/45">Add Transaction</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              Catat income atau expense
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Mulai dari sederhana dulu. Yang penting datanya hidup dan bisa dipakai sebagai input stabilitas.
            </p>
          </div>

          <TransactionForm />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <p className="text-sm text-white/45">Transactions</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              Riwayat transaksi terbaru
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Lihat cashflow yang sudah kamu catat dan gunakan untuk membaca stabilitasmu.
            </p>
          </div>

          <TransactionsList />
        </div>
      </section>
    </main>
  )
}