import { Card } from './Card'

export interface SimParams {
  startDate: string
  startBalance: number
  annualRatePct: number
}

interface Props {
  params: SimParams
  onChange: (params: SimParams) => void
}

export function SimulationParamsCard({ params, onChange }: Props) {
  return (
    <Card title="Parámetros de la simulación" subtitle="Verifica que coincidan con tu estado de cuenta; corrígelos si el PDF no se leyó bien">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Saldo de capital actual</label>
          <input
            type="number"
            step="0.01"
            value={params.startBalance}
            onChange={(e) => onChange({ ...params, startBalance: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Tasa de interés anual (%)</label>
          <input
            type="number"
            step="0.01"
            value={params.annualRatePct}
            onChange={(e) => onChange({ ...params, annualRatePct: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Fecha de corte (inicio de la proyección)</label>
          <input
            type="date"
            value={params.startDate}
            onChange={(e) => onChange({ ...params, startDate: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>
    </Card>
  )
}
