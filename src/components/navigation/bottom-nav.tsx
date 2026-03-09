"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Target,
  Wallet,
  ListTodo,
  Brain,
  BarChart3,
} from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/finance", icon: Wallet, label: "Money" },
    { href: "/actions", icon: ListTodo, label: "Actions" },
    { href: "/insights", icon: Brain, label: "Insights" },
    { href: "/review", icon: BarChart3, label: "Review" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-3 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[52px] flex-col items-center rounded-2xl px-2 py-2 text-[11px] transition ${
                isActive
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon size={18} />
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}