import { useMemo } from 'react'
import { compareScenarios } from '../lib/amortization'
import { formatCurrency, formatDate, monthsToYearsMonths } from '../lib/format'
import type { ExtraPaymentSettings } from '../lib/types'
import { Card } from './Card'

interface Props {
  startDate: string
  startBalance: number
  annualRatePct: number
  settings: ExtraPaymentSettings
}

export function StrategyTable({ startDate, startBalance, annualRatePct, settings }: Props) {
  const strategies = useMemo(() => {
    const presets: { label: string; extraMonthly: number; extraAnnual: number }[] = [
      { label: 'Sin pagos extra', extraMonthly: 0, extraAnnual: 0 },
      { label: '+ $500/mes', extraMonthly: 500, extraAnnual: 0 },
      { label: '+ $1,000/mes', extraMonthly: 1000, extraAnnual: 0 },
      { label: '+ $2,000/mes', extraMonthly: 2000, extraAnnual: 0 },
      {
        label: 'Solo aguinaldo anual ($10,000)',
        extraMonthly: 0,
        extraAnnual: 10000,
      },
      {
        label: 'Tu escenario actual',
        extraMonthly: settings.extraMonthly,
        extraAnnual: settings.extraAnnual,
      },
    ]

    return presets.map((preset) => {
      const scenarioSettings: ExtraPaymentSettings = {
        ...settings,
        extraMonthly: preset.extraMonthly,
        extraAnnual: preset.extraAnnual,
      }
      const comparison = compareScenarios(startDate, startBalance, annualRatePct, scenarioSettings)
      return { ...preset, comparison }
    })
  }, [startDate, startBalance, annualRatePct, settings])

  return (
    <Card title="Compara estrategias" subtitle="Distintas formas de acelerar la liquidación de tu crédito">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 pr-3">Estrategia</th>
              <th className="py-2 pr-3">Fecha de liquidación</th>
              <th className="py-2 pr-3">Tiempo restante</th>
              <th className="py-2 pr-3">Interés total</th>
              <th className="py-2 pr-3">Ahorro en tiempo</th>
              <th className="py-2 pr-3">Ahorro en interés</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map((s) => {
              const isBase = s.extraMonthly === 0 && s.extraAnnual === 0
              return (
                <tr key={s.label} className="border-b border-slate-100 dark:border-slate-800/60">
                  <td className="py-2 pr-3 font-medium text-slate-700 dark:text-slate-200">{s.label}</td>
                  <td className="py-2 pr-3">{formatDate(s.comparison.payoffDateWithExtras)}</td>
                  <td className="py-2 pr-3">{monthsToYearsMonths(s.comparison.withExtras.payoffMonths)}</td>
                  <td className="py-2 pr-3">{formatCurrency(s.comparison.withExtras.totalInterestPaid)}</td>
                  <td className="py-2 pr-3 text-brand-blue dark:text-blue-400">
                    {isBase || !Number.isFinite(s.comparison.monthsSaved) ? '—' : monthsToYearsMonths(s.comparison.monthsSaved)}
                  </td>
                  <td className="py-2 pr-3 text-brand-blue dark:text-blue-400">
                    {isBase || !Number.isFinite(s.comparison.interestSaved) ? '—' : formatCurrency(s.comparison.interestSaved)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
