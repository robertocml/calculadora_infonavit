import type { CreditInfo } from '../lib/types'
import { formatCurrency, monthsToYearsMonths } from '../lib/format'
import { Card } from './Card'

function monthsBetween(startIso?: string, endIso?: string): number | undefined {
  if (!startIso || !endIso) return undefined
  const [sy, sm] = startIso.split('-').map(Number)
  const [ey, em] = endIso.split('-').map(Number)
  return (ey - sy) * 12 + (em - sm)
}

export function ProgressCard({ credit }: { credit: CreditInfo }) {
  const paid =
    credit.montoOtorgamiento !== undefined && credit.saldoCapital !== undefined
      ? credit.montoOtorgamiento - credit.saldoCapital
      : undefined
  const pctPaid = paid !== undefined && credit.montoOtorgamiento ? (paid / credit.montoOtorgamiento) * 100 : undefined

  const elapsedMonths = monthsBetween(credit.fechaOtorgamiento, credit.fechaCorte)
  const totalMonths = credit.plazoAnios ? credit.plazoAnios * 12 : undefined
  const pctTime = elapsedMonths !== undefined && totalMonths ? (elapsedMonths / totalMonths) * 100 : undefined

  return (
    <Card title="Tu avance">
      <div className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">Capital liquidado</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {pctPaid !== undefined ? `${pctPaid.toFixed(1)}%` : '—'}
            </span>
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-blue"
              style={{ width: `${Math.min(100, Math.max(0, pctPaid ?? 0))}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {paid !== undefined ? `${formatCurrency(paid)} de ${formatCurrency(credit.montoOtorgamiento)}` : ''}
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">Tiempo transcurrido</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {pctTime !== undefined ? `${pctTime.toFixed(1)}%` : '—'}
            </span>
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-red"
              style={{ width: `${Math.min(100, Math.max(0, pctTime ?? 0))}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {elapsedMonths !== undefined && totalMonths
              ? `${monthsToYearsMonths(elapsedMonths)} de ${monthsToYearsMonths(totalMonths)} del plazo original`
              : ''}
          </p>
        </div>
      </div>
    </Card>
  )
}
