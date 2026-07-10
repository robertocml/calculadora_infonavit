import { useState } from 'react'
import { simulateAmortization, solveExtraMonthlyForTarget } from '../lib/amortization'
import { formatCurrency, formatDate } from '../lib/format'
import type { ExtraPaymentSettings } from '../lib/types'
import { Card } from './Card'

interface Props {
  startDate: string
  startBalance: number
  annualRatePct: number
  settings: ExtraPaymentSettings
}

export function GoalSeekTool({ startDate, startBalance, annualRatePct, settings }: Props) {
  const [targetYears, setTargetYears] = useState(10)
  const [result, setResult] = useState<{ extraMonthly: number; payoffDate: string | null } | null>(null)

  function handleCalculate() {
    const targetMonths = targetYears * 12
    const requiredExtra = solveExtraMonthlyForTarget(
      startDate,
      startBalance,
      annualRatePct,
      settings,
      targetMonths,
    )
    const sim = simulateAmortization({
      startDate,
      startBalance,
      annualRatePct,
      settings: { ...settings, extraMonthly: requiredExtra },
      applyExtras: true,
    })
    setResult({ extraMonthly: requiredExtra, payoffDate: sim.schedule.at(-1)?.date ?? null })
  }

  return (
    <Card title="Meta de liquidación" subtitle="Dime en cuánto tiempo quieres terminar y te digo cuánto abonar de más cada mes">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm text-slate-600 dark:text-slate-300">Quiero liquidar mi crédito en</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={40}
              value={targetYears}
              onChange={(e) => setTargetYears(Math.max(1, Number(e.target.value)))}
              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">años</span>
          </div>
        </div>
        <button
          onClick={handleCalculate}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Calcular
        </button>
      </div>

      {result && (
        <div className="mt-5 rounded-xl bg-teal-50 p-4 dark:bg-teal-950/30">
          {result.extraMonthly <= 0 ? (
            <p className="text-sm text-slate-700 dark:text-slate-200">
              ¡Con tu pago mensual base ya liquidas tu crédito antes de {targetYears} años! No necesitas abonar extra.
            </p>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Necesitas abonar <span className="font-semibold text-teal-700 dark:text-teal-300">{formatCurrency(result.extraMonthly)}</span> extra
              cada mes (además de tu pago base y tu aguinaldo, si aplicas alguno) para liquidar tu crédito alrededor de{' '}
              <span className="font-semibold">{formatDate(result.payoffDate)}</span>.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
