import type { ExtraPaymentSettings, Movement, ScheduleEntry, SimulationResult } from './types'

const MAX_MONTHS = 600 // 50 years safety cap

function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1 + months, d))
  return date.toISOString().slice(0, 10)
}

export interface SimulateParams {
  startDate: string // ISO, date of the first projected payment
  startBalance: number
  annualRatePct: number
  settings: ExtraPaymentSettings
  applyExtras: boolean
}

/**
 * Simulates a standard fixed-payment amortization forward from startBalance.
 * Extra payments (monthly and/or one annual lump sum) go entirely to principal.
 */
export function simulateAmortization({
  startDate,
  startBalance,
  annualRatePct,
  settings,
  applyExtras,
}: SimulateParams): SimulationResult {
  const monthlyRate = annualRatePct / 100 / 12
  const schedule: ScheduleEntry[] = []
  let balance = startBalance
  let totalInterest = 0
  let totalPrincipal = 0
  let month = 0
  let neverZero = false

  while (balance > 0.005) {
    month += 1
    if (month > MAX_MONTHS) {
      neverZero = true
      break
    }
    const date = addMonths(startDate, month)
    const interest = balance * monthlyRate
    const monthOfYear = Number(date.slice(5, 7))

    let extra = 0
    if (applyExtras) {
      extra += settings.extraMonthly
      if (settings.extraAnnual > 0 && monthOfYear === settings.extraAnnualMonth) {
        extra += settings.extraAnnual
      }
    }

    let payment = settings.monthlyBasePayment + extra
    let principal = payment - interest

    if (principal <= 0) {
      // Payment doesn't even cover interest: balance grows, bail out to avoid infinite loop.
      neverZero = true
      break
    }

    if (principal >= balance) {
      principal = balance
      payment = principal + interest
      extra = Math.max(0, payment - settings.monthlyBasePayment)
    }

    balance -= principal
    totalInterest += interest
    totalPrincipal += principal

    schedule.push({
      monthIndex: month,
      date,
      paymentTotal: payment,
      interestPaid: interest,
      principalPaid: principal,
      extraApplied: extra,
      balance,
    })
  }

  return {
    schedule,
    payoffMonths: neverZero ? Infinity : month,
    totalInterestPaid: totalInterest,
    totalPrincipalPaid: totalPrincipal,
    totalPaid: totalInterest + totalPrincipal,
    balanceNeverReachesZero: neverZero,
  }
}

export interface ComparisonSummary {
  baseline: SimulationResult
  withExtras: SimulationResult
  monthsSaved: number
  interestSaved: number
  payoffDateBaseline: string | null
  payoffDateWithExtras: string | null
}

export function compareScenarios(
  startDate: string,
  startBalance: number,
  annualRatePct: number,
  settings: ExtraPaymentSettings,
): ComparisonSummary {
  const baseline = simulateAmortization({
    startDate,
    startBalance,
    annualRatePct,
    settings,
    applyExtras: false,
  })
  const withExtras = simulateAmortization({
    startDate,
    startBalance,
    annualRatePct,
    settings,
    applyExtras: true,
  })

  const monthsSaved = baseline.balanceNeverReachesZero
    ? Infinity
    : withExtras.balanceNeverReachesZero
      ? -Infinity
      : baseline.payoffMonths - withExtras.payoffMonths
  const interestSaved = baseline.balanceNeverReachesZero || withExtras.balanceNeverReachesZero
    ? NaN
    : baseline.totalInterestPaid - withExtras.totalInterestPaid

  return {
    baseline,
    withExtras,
    monthsSaved,
    interestSaved,
    payoffDateBaseline: baseline.schedule.at(-1)?.date ?? null,
    payoffDateWithExtras: withExtras.schedule.at(-1)?.date ?? null,
  }
}

/**
 * Binary-searches the extra monthly payment needed to pay off the loan
 * within targetMonths (extraAnnual from settings is kept as-is).
 */
export function solveExtraMonthlyForTarget(
  startDate: string,
  startBalance: number,
  annualRatePct: number,
  settings: ExtraPaymentSettings,
  targetMonths: number,
): number {
  let lo = 0
  let hi = startBalance // upper bound: paying off in ~1 month
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    const result = simulateAmortization({
      startDate,
      startBalance,
      annualRatePct,
      settings: { ...settings, extraMonthly: mid },
      applyExtras: true,
    })
    if (result.payoffMonths > targetMonths) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return Math.ceil(hi)
}

export interface ChartRow {
  date: string
  historico?: number
  sinExtra?: number
  conExtra?: number
}

/**
 * Merges the historical (already-happened) balance points from the statement's
 * movements with the two projected schedules, keyed by date, so a single chart
 * can render "Histórico", "Sin pagos extra" and "Con pagos extra" as one timeline.
 */
export function buildChartData(
  movements: Movement[],
  comparison: ComparisonSummary,
  startDate: string,
  startBalance: number,
): ChartRow[] {
  const rows = new Map<string, ChartRow>()
  const set = (date: string, patch: Partial<ChartRow>) => {
    rows.set(date, { ...(rows.get(date) ?? { date }), ...patch })
  }

  const lastBalanceByDate = new Map<string, number>()
  for (const m of movements) lastBalanceByDate.set(m.fecha, m.saldoCapital)
  for (const [date, balance] of lastBalanceByDate) set(date, { historico: balance })

  set(startDate, { historico: startBalance, sinExtra: startBalance, conExtra: startBalance })
  for (const entry of comparison.baseline.schedule) set(entry.date, { sinExtra: entry.balance })
  for (const entry of comparison.withExtras.schedule) set(entry.date, { conExtra: entry.balance })

  return Array.from(rows.values()).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}
