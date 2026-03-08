"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type WeeklyActivityChartProps = {
  data: {
    day: string
    completed: number
  }[]
}

export default function WeeklyActivityChart({
  data,
}: WeeklyActivityChartProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <p className="text-sm text-white/45">Activity Trend</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          Ritme 7 hari terakhir
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Lihat kapan kamu aktif dan seberapa stabil ritme progress kamu minggu ini.
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15,15,15,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                color: "white",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="white"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "white" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}