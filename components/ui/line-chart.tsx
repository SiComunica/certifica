"use client"

interface ChartData {
  name: string
  value: number
}

interface LineChartProps {
  data: ChartData[]
}

export function LineChart({ data }: LineChartProps) {
  // Versione semplificata che mostra solo i dati in formato tabella
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Mese</th>
            <th className="text-right py-2">Valore</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{item.name}</td>
              <td className="text-right py-2">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 