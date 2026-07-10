import type { ExtraPaymentSettings } from '../lib/types'
import { formatCurrency } from '../lib/format'
import { Card } from './Card'

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

interface Props {
  settings: ExtraPaymentSettings
  onChange: (settings: ExtraPaymentSettings) => void
  suggestedBase?: number
}

function NumberField({
  label,
  value,
  onChange,
  max,
  step = 100,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  max: number
  step?: number
  hint?: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-slate-600 dark:text-slate-300">{label}</label>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={Math.min(value, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand-blue"
      />
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      />
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}

export function ExtraPaymentControls({ settings, onChange, suggestedBase }: Props) {
  return (
    <Card title="Simula pagos anticipados" subtitle="Ajusta los valores y observa el efecto en la gráfica de abajo">
      <div className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-sm text-slate-600 dark:text-slate-300">Pago mensual base</label>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {formatCurrency(settings.monthlyBasePayment)}
            </span>
          </div>
          <input
            type="number"
            min={0}
            step={100}
            value={settings.monthlyBasePayment}
            onChange={(e) =>
              onChange({ ...settings, monthlyBasePayment: Math.max(0, Number(e.target.value)) })
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {suggestedBase
              ? `Prellenado con tu mensualidad oficial (${formatCurrency(suggestedBase)}). Ajústalo si tu retención real es distinta.`
              : 'Monto que pagas normalmente cada mes.'}
          </p>
        </div>

        <NumberField
          label="Pago extra mensual"
          value={settings.extraMonthly}
          onChange={(v) => onChange({ ...settings, extraMonthly: v })}
          max={Math.max(5000, settings.monthlyBasePayment * 2)}
          hint="Un abono adicional que harás todos los meses, además de tu mensualidad."
        />

        <div>
          <NumberField
            label="Pago extra anual (aguinaldo, bono, etc.)"
            value={settings.extraAnnual}
            onChange={(v) => onChange({ ...settings, extraAnnual: v })}
            max={Math.max(20000, settings.monthlyBasePayment * 6)}
            step={500}
            hint="Un abono único que harás una vez al año."
          />
          {settings.extraAnnual > 0 && (
            <div className="mt-3">
              <label className="text-sm text-slate-600 dark:text-slate-300">Mes en que harás el abono anual</label>
              <select
                value={settings.extraAnnualMonth}
                onChange={(e) => onChange({ ...settings, extraAnnualMonth: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
