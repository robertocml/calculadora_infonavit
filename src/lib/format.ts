const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const currencyFormatterDecimals = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number | undefined | null, decimals = false): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return decimals ? currencyFormatterDecimals.format(value) : currencyFormatter.format(value)
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export function formatMonthYear(iso: string | undefined | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function monthsToYearsMonths(totalMonths: number): string {
  if (!Number.isFinite(totalMonths)) return '—'
  const years = Math.floor(totalMonths / 12)
  const months = Math.round(totalMonths % 12)
  const parts: string[] = []
  if (years > 0) parts.push(`${years} año${years === 1 ? '' : 's'}`)
  if (months > 0 || years === 0) parts.push(`${months} mes${months === 1 ? '' : 'es'}`)
  return parts.join(' ')
}
