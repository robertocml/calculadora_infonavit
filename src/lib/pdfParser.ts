import type { CreditInfo, Movement, ParsedStatement } from './types'

let pdfjsLibPromise: ReturnType<typeof loadPdfjs> | undefined

async function loadPdfjs() {
  const [pdfjsLib, { default: pdfjsWorker }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
  return pdfjsLib
}

const MONTHS: Record<string, string> = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  setiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
}

function parseSpanishDate(text: string): string | undefined {
  const m = text.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i)
  if (!m) return undefined
  const day = m[1].padStart(2, '0')
  const monthNum = MONTHS[m[2].toLowerCase()]
  if (!monthNum) return undefined
  return `${m[3]}-${monthNum}-${day}`
}

function ddmmyyyyToISO(text: string): string | undefined {
  const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return undefined
  return `${m[3]}-${m[2]}-${m[1]}`
}

function parseMoney(text: string): number | undefined {
  const m = text.match(/-?[\d,]+\.\d{1,2}/)
  if (!m) return undefined
  return parseFloat(m[0].replace(/,/g, ''))
}

function parsePercent(text: string): number | undefined {
  const m = text.match(/([\d.]+)\s*%/)
  if (!m) return undefined
  return parseFloat(m[1])
}

function parseYears(text: string): number | undefined {
  const m = text.match(/(\d+)\s*A[ÑN]OS?/i)
  if (m) return parseInt(m[1], 10)
  const asNumber = text.match(/(\d+)/)
  return asNumber ? parseInt(asNumber[1], 10) : undefined
}

/** Extracts the substring between `startLabel` and whichever `endLabels` occurs first after it. */
function extractBetween(text: string, startLabel: string, endLabels: string[]): string | undefined {
  const startIdx = text.indexOf(startLabel)
  if (startIdx === -1) return undefined
  const from = startIdx + startLabel.length
  let endIdx = text.length
  for (const label of endLabels) {
    const idx = text.indexOf(label, from)
    if (idx !== -1 && idx < endIdx) endIdx = idx
  }
  return text.slice(from, endIdx).replace(/\s+/g, ' ').trim()
}

async function extractPdfLines(file: File): Promise<string[]> {
  if (!pdfjsLibPromise) pdfjsLibPromise = loadPdfjs()
  const pdfjsLib = await pdfjsLibPromise
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const lines: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const items = content.items as { str: string; transform: number[] }[]

    const rows: { y: number; entries: { x: number; str: string }[] }[] = []
    const TOLERANCE = 3

    for (const item of items) {
      if (!item.str || !item.str.trim()) continue
      const x = item.transform[4]
      const y = item.transform[5]
      let row = rows.find((r) => Math.abs(r.y - y) <= TOLERANCE)
      if (!row) {
        row = { y, entries: [] }
        rows.push(row)
      }
      row.entries.push({ x, str: item.str })
    }

    rows.sort((a, b) => b.y - a.y)
    for (const row of rows) {
      row.entries.sort((a, b) => a.x - b.x)
      const line = row.entries
        .map((e) => e.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (line) lines.push(line)
    }
  }

  return lines
}

function parseCreditInfo(fullText: string): { credit: CreditInfo; warnings: string[] } {
  const credit: CreditInfo = {}
  const warnings: string[] = []

  const fields: [keyof CreditInfo, string, string[], (v: string) => unknown][] = [
    ['numeroCredito', 'mero de crédito', ['Tipo de crédito'], (v) => v.split(' ')[0]],
    ['tipoCredito', 'Tipo de crédito', ['Fecha de otorgamiento'], (v) => v],
    ['fechaOtorgamiento', 'Fecha de otorgamiento', ['Plazo'], parseSpanishDate],
    ['plazoAnios', 'Plazo', ['Monto de otorgamiento'], parseYears],
    ['montoOtorgamiento', 'Monto de otorgamiento', ['Tipo de moneda'], parseMoney],
    ['tipoMoneda', 'Tipo de moneda', ['Tasa de interés'], (v) => v],
    ['tasaInteres', 'Tasa de interés', ['Tipo de tasa de interés'], parsePercent],
    ['tipoTasaInteres', 'Tipo de tasa de interés', ['Tipo de pago'], (v) => v],
    ['tipoPago', 'Tipo de pago', ['Saldo de capital'], (v) => v],
    ['saldoCapital', 'Saldo de capital', ['Mensualidad con relación laboral'], parseMoney],
    [
      'mensualidadConRelacionLaboral',
      'Mensualidad con relación laboral',
      ['Saldo de interés'],
      parseMoney,
    ],
    ['saldoInteres', 'Saldo de interés', ['Mensualidad sin relación laboral'], parseMoney],
    [
      'mensualidadSinRelacionLaboral',
      'Mensualidad sin relación laboral',
      ['Comisiones'],
      parseMoney,
    ],
    ['comisiones', 'Comisiones', ['Saldo total del crédito'], parseMoney],
    ['saldoTotalCredito', 'Saldo total del crédito', ['Fecha de corte'], parseMoney],
    [
      'fechaCorte',
      'Fecha de corte estado de cuenta',
      ['Movimientos en pesos', 'Fecha Transacción'],
      parseSpanishDate,
    ],
  ]

  for (const [key, startLabel, endLabels, parser] of fields) {
    const raw = extractBetween(fullText, startLabel, endLabels)
    if (raw === undefined) {
      warnings.push(`No se encontró el campo "${startLabel}" en el PDF.`)
      continue
    }
    const value = parser(raw)
    if (value === undefined || (typeof value === 'number' && Number.isNaN(value))) {
      warnings.push(`No se pudo interpretar el valor de "${startLabel}" ("${raw}").`)
      continue
    }
    ;(credit as Record<string, unknown>)[key] = value
  }

  return { credit, warnings }
}

const NUM_RE = /^-?[\d,]+\.\d{1,2}$/
const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/

function parseMovementLine(line: string): Movement | undefined {
  const tokens = line.trim().split(/\s+/)
  if (tokens.length < 9) return undefined
  if (!DATE_RE.test(tokens[0])) return undefined

  const last5 = tokens.slice(-5)
  if (!last5.every((t) => NUM_RE.test(t))) return undefined

  const fecha = ddmmyyyyToISO(tokens[0])
  if (!fecha) return undefined

  const origenIdx = tokens.length - 6
  const codigo = tokens[1]
  const concepto = tokens.slice(2, origenIdx).join(' ')
  const origen = tokens[origenIdx]

  const [montoStr, comisionesStr, interesStr, capitalStr, saldoStr] = last5

  return {
    fecha,
    codigo,
    concepto,
    origen,
    montoTransaccion: parseFloat(montoStr.replace(/,/g, '')),
    comisiones: parseFloat(comisionesStr.replace(/,/g, '')),
    pagoIntereses: parseFloat(interesStr.replace(/,/g, '')),
    pagoCapital: parseFloat(capitalStr.replace(/,/g, '')),
    saldoCapital: parseFloat(saldoStr.replace(/,/g, '')),
  }
}

function parseMovements(lines: string[]): Movement[] {
  const movements: Movement[] = []
  for (const line of lines) {
    const mv = parseMovementLine(line)
    if (mv) movements.push(mv)
  }
  movements.sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0))
  return movements
}

export async function parseInfonavitStatement(file: File): Promise<ParsedStatement> {
  const lines = await extractPdfLines(file)
  const fullText = lines.join(' \n ')

  const { credit, warnings } = parseCreditInfo(fullText)
  const movements = parseMovements(lines)

  if (movements.length === 0) {
    warnings.push('No se encontraron movimientos en la tabla del PDF. Podrás capturarlos manualmente.')
  }

  return { credit, movements, warnings }
}
