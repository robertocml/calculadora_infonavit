export interface CreditInfo {
  numeroCredito?: string
  tipoCredito?: string
  fechaOtorgamiento?: string // ISO yyyy-mm-dd
  plazoAnios?: number
  montoOtorgamiento?: number
  tipoMoneda?: string
  tasaInteres?: number // e.g. 6.5 (percent)
  tipoTasaInteres?: string
  tipoPago?: string
  saldoCapital?: number
  mensualidadConRelacionLaboral?: number
  mensualidadSinRelacionLaboral?: number
  saldoInteres?: number
  comisiones?: number
  saldoTotalCredito?: number
  fechaCorte?: string // ISO yyyy-mm-dd
}

export interface Movement {
  fecha: string // ISO yyyy-mm-dd
  codigo: string
  concepto: string
  origen: string
  montoTransaccion: number
  comisiones: number
  pagoIntereses: number
  pagoCapital: number
  saldoCapital: number
}

export interface ParsedStatement {
  credit: CreditInfo
  movements: Movement[]
  warnings: string[]
}

export interface ScheduleEntry {
  monthIndex: number
  date: string // ISO
  paymentTotal: number
  interestPaid: number
  principalPaid: number
  extraApplied: number
  balance: number
}

export interface SimulationResult {
  schedule: ScheduleEntry[]
  payoffMonths: number
  totalInterestPaid: number
  totalPrincipalPaid: number
  totalPaid: number
  balanceNeverReachesZero: boolean
}

export interface ExtraPaymentSettings {
  monthlyBasePayment: number
  extraMonthly: number
  extraAnnual: number
  extraAnnualMonth: number // 1-12
}
