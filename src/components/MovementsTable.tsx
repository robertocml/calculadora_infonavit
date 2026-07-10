import { useState } from 'react'
import { formatCurrency, formatDate } from '../lib/format'
import type { Movement } from '../lib/types'
import { Card } from './Card'

interface Props {
  movements: Movement[]
  onChange: (movements: Movement[]) => void
}

const EMPTY_MOVEMENT: Movement = {
  fecha: new Date().toISOString().slice(0, 10),
  codigo: '',
  concepto: '',
  origen: '-',
  montoTransaccion: 0,
  comisiones: 0,
  pagoIntereses: 0,
  pagoCapital: 0,
  saldoCapital: 0,
}

function EditableCell({
  value,
  onChange,
  type = 'text',
}: {
  value: string | number
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
    />
  )
}

export function MovementsTable({ movements, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  function updateRow(index: number, patch: Partial<Movement>) {
    const next = movements.slice()
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  function deleteRow(index: number) {
    onChange(movements.filter((_, i) => i !== index))
  }

  function addRow() {
    onChange([...movements, { ...EMPTY_MOVEMENT }])
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          {open ? '▾' : '▸'} Movimientos del estado de cuenta ({movements.length})
        </button>
        {open && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {editing ? 'Terminar edición' : 'Editar / corregir'}
            </button>
            {editing && (
              <button
                onClick={addRow}
                className="rounded-lg bg-brand-blue px-3 py-1 text-xs font-medium text-white hover:bg-brand-blueDark"
              >
                + Agregar movimiento
              </button>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-2">Fecha</th>
                <th className="py-2 pr-2">Código</th>
                <th className="py-2 pr-2">Concepto</th>
                <th className="py-2 pr-2">Origen</th>
                <th className="py-2 pr-2">Monto</th>
                <th className="py-2 pr-2">Comisiones</th>
                <th className="py-2 pr-2">Pago intereses</th>
                <th className="py-2 pr-2">Pago capital</th>
                <th className="py-2 pr-2">Saldo capital</th>
                {editing && <th className="py-2 pr-2" />}
              </tr>
            </thead>
            <tbody>
              {movements.map((m, i) =>
                editing ? (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-1 pr-2"><EditableCell type="date" value={m.fecha} onChange={(v) => updateRow(i, { fecha: v })} /></td>
                    <td className="py-1 pr-2"><EditableCell value={m.codigo} onChange={(v) => updateRow(i, { codigo: v })} /></td>
                    <td className="py-1 pr-2"><EditableCell value={m.concepto} onChange={(v) => updateRow(i, { concepto: v })} /></td>
                    <td className="py-1 pr-2"><EditableCell value={m.origen} onChange={(v) => updateRow(i, { origen: v })} /></td>
                    <td className="py-1 pr-2"><EditableCell type="number" value={m.montoTransaccion} onChange={(v) => updateRow(i, { montoTransaccion: Number(v) })} /></td>
                    <td className="py-1 pr-2"><EditableCell type="number" value={m.comisiones} onChange={(v) => updateRow(i, { comisiones: Number(v) })} /></td>
                    <td className="py-1 pr-2"><EditableCell type="number" value={m.pagoIntereses} onChange={(v) => updateRow(i, { pagoIntereses: Number(v) })} /></td>
                    <td className="py-1 pr-2"><EditableCell type="number" value={m.pagoCapital} onChange={(v) => updateRow(i, { pagoCapital: Number(v) })} /></td>
                    <td className="py-1 pr-2"><EditableCell type="number" value={m.saldoCapital} onChange={(v) => updateRow(i, { saldoCapital: Number(v) })} /></td>
                    <td className="py-1 pr-2">
                      <button onClick={() => deleteRow(i)} className="text-red-500 hover:text-red-700">✕</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-1.5 pr-2 whitespace-nowrap">{formatDate(m.fecha)}</td>
                    <td className="py-1.5 pr-2">{m.codigo}</td>
                    <td className="py-1.5 pr-2">{m.concepto}</td>
                    <td className="py-1.5 pr-2">{m.origen}</td>
                    <td className="py-1.5 pr-2 whitespace-nowrap">{formatCurrency(m.montoTransaccion, true)}</td>
                    <td className="py-1.5 pr-2 whitespace-nowrap">{formatCurrency(m.comisiones, true)}</td>
                    <td className="py-1.5 pr-2 whitespace-nowrap">{formatCurrency(m.pagoIntereses, true)}</td>
                    <td className="py-1.5 pr-2 whitespace-nowrap">{formatCurrency(m.pagoCapital, true)}</td>
                    <td className="py-1.5 pr-2 whitespace-nowrap">{formatCurrency(m.saldoCapital, true)}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
