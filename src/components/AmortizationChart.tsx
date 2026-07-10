import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { buildChartData, type ComparisonSummary } from '../lib/amortization'
import { formatCurrency, formatDate, formatMonthYear } from '../lib/format'
import type { Movement } from '../lib/types'
import { Card } from './Card'

interface Props {
  movements: Movement[]
  comparison: ComparisonSummary
  startDate: string
  startBalance: number
}

export function AmortizationChart({ movements, comparison, startDate, startBalance }: Props) {
  const data = useMemo(
    () => buildChartData(movements, comparison, startDate, startBalance),
    [movements, comparison, startDate, startBalance],
  )

  return (
    <Card title="Evolución de la deuda" subtitle="Histórico vs. proyección: sin pagos extra contra con pagos extra">
      <div className="h-80 w-full sm:h-96">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => formatMonthYear(v)}
              minTickGap={50}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickFormatter={(v: number) => formatCurrency(v)} width={90} tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(v) => formatDate(v as string)}
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
            />
            <Legend />
            <ReferenceLine x={startDate} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Hoy', fontSize: 11, fill: '#94a3b8' }} />
            <Line type="monotone" dataKey="historico" name="Histórico" stroke="#64748b" dot={false} strokeWidth={2} connectNulls />
            <Line type="monotone" dataKey="sinExtra" name="Sin pagos extra" stroke="#0ea5e9" dot={false} strokeWidth={2} connectNulls />
            <Line type="monotone" dataKey="conExtra" name="Con pagos extra" stroke="#16a34a" dot={false} strokeWidth={2.5} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
