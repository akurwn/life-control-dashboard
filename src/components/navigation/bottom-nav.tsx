"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Target, Wallet, ListTodo, Brain } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/finance", icon: Wallet, label: "Money" },
    { href: "/actions", icon: ListTodo, label: "Actions" },
    { href: "/insights", icon: Brain, label: "Insights" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md justify-between px-6 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center text-xs ${
                active ? "text-white" : "text-white/40"
              }`}
            >
              <Icon size={20} />
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}