import { useState } from 'react'
import type { CreditInfo } from '../lib/types'
import { formatCurrency, formatDate } from '../lib/format'
import { Card, Stat } from './Card'

interface FieldConfig {
  key: keyof CreditInfo
  label: string
  type: 'text' | 'number' | 'date'
  format?: (credit: CreditInfo) => string
}

const FIELDS: FieldConfig[] = [
  { key: 'numeroCredito', label: 'Número de crédito', type: 'text' },
  { key: 'montoOtorgamiento', label: 'Monto otorgado', type: 'number', format: (c) => formatCurrency(c.montoOtorgamiento) },
  { key: 'saldoCapital', label: 'Saldo de capital actual', type: 'number', format: (c) => formatCurrency(c.saldoCapital) },
  {
    key: 'tasaInteres',
    label: 'Tasa de interés anual (%)',
    type: 'number',
    format: (c) => (c.tasaInteres !== undefined ? `${c.tasaInteres}% anual${c.tipoTasaInteres ? ` (${c.tipoTasaInteres})` : ''}` : '—'),
  },
  { key: 'plazoAnios', label: 'Plazo original (años)', type: 'number', format: (c) => (c.plazoAnios ? `${c.plazoAnios} años` : '—') },
  {
    key: 'mensualidadConRelacionLaboral',
    label: 'Mensualidad (con relación laboral)',
    type: 'number',
    format: (c) => formatCurrency(c.mensualidadConRelacionLaboral),
  },
  {
    key: 'mensualidadSinRelacionLaboral',
    label: 'Mensualidad (sin relación laboral)',
    type: 'number',
    format: (c) => formatCurrency(c.mensualidadSinRelacionLaboral),
  },
  { key: 'fechaOtorgamiento', label: 'Fecha de otorgamiento', type: 'date', format: (c) => formatDate(c.fechaOtorgamiento) },
  { key: 'fechaCorte', label: 'Fecha de corte del estado de cuenta', type: 'date', format: (c) => formatDate(c.fechaCorte) },
]

interface Props {
  credit: CreditInfo
  onChange: (credit: CreditInfo) => void
  startInEditMode?: boolean
}

export function CreditSummary({ credit, onChange, startInEditMode }: Props) {
  const [editing, setEditing] = useState(Boolean(startInEditMode))

  function updateField(key: keyof CreditInfo, type: FieldConfig['type'], raw: string) {
    if (type === 'number') {
      onChange({ ...credit, [key]: raw === '' ? undefined : Number(raw) })
    } else {
      onChange({ ...credit, [key]: raw === '' ? undefined : raw })
    }
  }

  return (
    <Card
      title="Tu crédito"
      subtitle={!editing && credit.numeroCredito ? `Número de crédito ${credit.numeroCredito}` : undefined}
    >
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setEditing((e) => !e)}
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {editing ? 'Terminar edición' : 'Editar datos del crédito'}
        </button>
      </div>

      {editing ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-xs text-slate-500 dark:text-slate-400">{field.label}</label>
              <input
                type={field.type}
                step={field.type === 'number' ? '0.01' : undefined}
                value={(credit[field.key] as string | number | undefined) ?? ''}
                onChange={(e) => updateField(field.key, field.type, e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FIELDS.map((field) => (
            <Stat key={field.key} label={field.label} value={field.format ? field.format(credit) : ((credit[field.key] as string) ?? '—')} />
          ))}
        </div>
      )}
    </Card>
  )
}
