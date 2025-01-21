"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    month: "Gen",
    total: 2,
  },
  {
    month: "Feb",
    total: 3,
  },
  {
    month: "Mar",
    total: 4,
  },
  {
    month: "Apr",
    total: 6,
  },
  {
    month: "Mag",
    total: 6,
  },
  {
    month: "Giu",
    total: 8,
  },
  {
    month: "Lug",
    total: 10,
  },
  {
    month: "Ago",
    total: 10,
  },
  {
    month: "Set",
    total: 12,
  },
]

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 