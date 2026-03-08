"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Today & direction",
  },
  {
    label: "Goals",
    href: "/goals",
    description: "Progress & targets",
  },
  {
    label: "Actions",
    href: "/actions",
    description: "Execution layer",
  },
  {
    label: "Insights",
    href: "/insights",
    description: "Patterns & analytics",
  },
  {
    label: "Review",
    href: "/review",
    description: "Weekly reflection",
  },
  {
    label: "Finance",
    href: "/finance",
    description: "Money control",
  },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full border-b border-white/10 bg-black/20 backdrop-blur md:w-72 md:border-b-0 md:border-r md:bg-white/5">
      <div className="border-b border-white/10 p-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">
          Life OS
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Control Center
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/50">
          Dashboard untuk melihat arah hidup, progress, dan tindakan hari ini.
        </p>
      </div>

      <nav className="flex gap-3 overflow-x-auto px-4 py-4 md:block md:space-y-2 md:overflow-visible">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block min-w-[180px] rounded-2xl border px-4 py-3 transition md:min-w-0 ${
                isActive
                  ? "border-white/10 bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.08)]"
                  : "border-transparent bg-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="text-sm font-medium">{item.label}</div>
              <div
                className={`mt-1 text-xs ${
                  isActive ? "text-black/60" : "text-white/40"
                }`}
              >
                {item.description}
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}