import type { CreditInfo } from '../lib/types'
import { formatCurrency, formatDate } from '../lib/format'
import { Card, Stat } from './Card'

export function CreditSummary({ credit }: { credit: CreditInfo }) {
  return (
    <Card title="Tu crédito" subtitle={credit.numeroCredito ? `Número de crédito ${credit.numeroCredito}` : undefined}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Monto otorgado" value={formatCurrency(credit.montoOtorgamiento)} />
        <Stat label="Saldo de capital actual" value={formatCurrency(credit.saldoCapital)} />
        <Stat label="Tasa de interés" value={credit.tasaInteres ? `${credit.tasaInteres}% anual (${credit.tipoTasaInteres ?? ''})` : '—'} />
        <Stat label="Plazo original" value={credit.plazoAnios ? `${credit.plazoAnios} años` : '—'} />
        <Stat label="Mensualidad (con relación laboral)" value={formatCurrency(credit.mensualidadConRelacionLaboral)} />
        <Stat label="Mensualidad (sin relación laboral)" value={formatCurrency(credit.mensualidadSinRelacionLaboral)} />
        <Stat label="Fecha de otorgamiento" value={formatDate(credit.fechaOtorgamiento)} />
        <Stat label="Fecha de corte del estado de cuenta" value={formatDate(credit.fechaCorte)} />
      </div>
    </Card>
  )
}
