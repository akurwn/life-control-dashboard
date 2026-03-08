type GoalInput = {
  id: string
  title: string
  target_amount: number | string | null
  current_amount: number | string | null
  deadline: string | null
}

export type SimulatorPreset = {
  key: string
  label: string
  description: string
  incomeChangePercent: number
  expenseChangePercent: number
  source: "core" | "dynamic"
}

const corePresets: SimulatorPreset[] = [
  {
    key: "resign",
    label: "Resign Scenario",
    description: "Income berhenti total, expense tetap berjalan.",
    incomeChangePercent: -100,
    expenseChangePercent: 0,
    source: "core",
  },
  {
    key: "income-drop",
    label: "Income Drop",
    description: "Income turun, expense naik sedikit.",
    incomeChangePercent: -30,
    expenseChangePercent: 10,
    source: "core",
  },
  {
    key: "side-hustle",
    label: "Start Side Hustle",
    description: "Income naik perlahan, expense juga naik karena modal gerak.",
    incomeChangePercent: 20,
    expenseChangePercent: 10,
    source: "core",
  },
  {
    key: "big-purchase",
    label: "Big Purchase",
    description: "Expense naik besar karena pembelian penting seperti laptop, course, atau alat kerja.",
    incomeChangePercent: 0,
    expenseChangePercent: 35,
    source: "core",
  },
  {
    key: "recovery",
    label: "Recovery Mode",
    description: "Income mulai naik, expense ditekan supaya kondisi kembali stabil.",
    incomeChangePercent: 15,
    expenseChangePercent: -10,
    source: "core",
  },
]

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

export function buildSimulatorPresets(goals: GoalInput[]) {
  const dynamic: SimulatorPreset[] = []
  const seen = new Set<string>()

  for (const goal of goals) {
    const title = (goal.title || "").toLowerCase()

    if (
      includesAny(title, [
        "laptop",
        "macbook",
        "computer",
        "pc",
        "device",
        "kamera",
        "camera",
        "iphone",
        "hp",
      ]) &&
      !seen.has("buy-laptop")
    ) {
      dynamic.push({
        key: "buy-laptop",
        label: "Buy Device",
        description: `Simulasi pembelian alat penting untuk goal "${goal.title}".`,
        incomeChangePercent: 0,
        expenseChangePercent: 25,
        source: "dynamic",
      })
      seen.add("buy-laptop")
    }

    if (
      includesAny(title, [
        "career",
        "resign",
        "switch",
        "job",
        "kerja",
        "freelance",
        "upskill",
        "portfolio",
      ]) &&
      !seen.has("pay-course")
    ) {
      dynamic.push({
        key: "pay-course",
        label: "Pay Course",
        description: `Simulasi investasi skill untuk mendukung goal "${goal.title}".`,
        incomeChangePercent: 0,
        expenseChangePercent: 18,
        source: "dynamic",
      })
      seen.add("pay-course")
    }

    if (
      includesAny(title, [
        "freelance",
        "business",
        "startup",
        "usaha",
        "side hustle",
        "agency",
      ]) &&
      !seen.has("start-freelance")
    ) {
      dynamic.push({
        key: "start-freelance",
        label: "Start Freelance",
        description: `Simulasi memulai income baru untuk mendorong goal "${goal.title}".`,
        incomeChangePercent: 12,
        expenseChangePercent: 8,
        source: "dynamic",
      })
      seen.add("start-freelance")
    }

    if (
      includesAny(title, [
        "emergency",
        "darurat",
        "buffer",
        "safety",
        "secure",
      ]) &&
      !seen.has("emergency-buffer")
    ) {
      dynamic.push({
        key: "emergency-buffer",
        label: "Emergency Buffer",
        description: `Simulasi fokus membangun buffer untuk goal "${goal.title}".`,
        incomeChangePercent: 0,
        expenseChangePercent: -15,
        source: "dynamic",
      })
      seen.add("emergency-buffer")
    }
  }

  return {
    core: corePresets,
    dynamic,
  }
}