import type { ComparisonSummary } from '../lib/amortization'
import { formatCurrency, formatDate, monthsToYearsMonths } from '../lib/format'
import { Card, Stat } from './Card'

export function ComparisonSummaryCard({ comparison }: { comparison: ComparisonSummary }) {
  const { baseline, withExtras, monthsSaved, interestSaved } = comparison

  const noExtraSelected = monthsSaved === 0

  return (
    <Card title="¿Qué tanto te ahorras?">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl bg-sky-50 p-4 dark:bg-sky-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Sin pagos extra</p>
          <div className="mt-3 space-y-3">
            <Stat label="Fecha de liquidación" value={formatDate(comparison.payoffDateBaseline)} />
            <Stat label="Tiempo restante" value={monthsToYearsMonths(baseline.payoffMonths)} />
            <Stat label="Interés total a pagar" value={formatCurrency(baseline.totalInterestPaid)} />
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Con pagos extra</p>
          <div className="mt-3 space-y-3">
            <Stat label="Fecha de liquidación" value={formatDate(comparison.payoffDateWithExtras)} />
            <Stat label="Tiempo restante" value={monthsToYearsMonths(withExtras.payoffMonths)} />
            <Stat label="Interés total a pagar" value={formatCurrency(withExtras.totalInterestPaid)} />
          </div>
        </div>
      </div>

      {!noExtraSelected && !withExtras.balanceNeverReachesZero && (
        <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/30 sm:grid-cols-2">
          <Stat
            label="Tiempo que te ahorras"
            value={Number.isFinite(monthsSaved) ? monthsToYearsMonths(monthsSaved) : '—'}
          />
          <Stat
            label="Interés que te ahorras"
            value={Number.isFinite(interestSaved) ? formatCurrency(interestSaved) : '—'}
          />
        </div>
      )}

      {baseline.balanceNeverReachesZero && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          Con el pago mensual base indicado, el crédito no se liquida en 50 años (el pago no alcanza a cubrir el interés).
          Revisa el monto de tu pago mensual base.
        </p>
      )}
    </Card>
  )
}
