import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ComparisonSummaryCard } from './components/ComparisonSummary'
import { CreditSummary } from './components/CreditSummary'
import { ExtraPaymentControls } from './components/ExtraPaymentControls'
import { FileUpload } from './components/FileUpload'
import { GoalSeekTool } from './components/GoalSeekTool'
import { MovementsTable } from './components/MovementsTable'
import { ProgressCard } from './components/ProgressCard'
import { StrategyTable } from './components/StrategyTable'
import { compareScenarios } from './lib/amortization'
import { parseInfonavitStatement } from './lib/pdfParser'
import { clearStorage, loadFromStorage, saveToStorage } from './lib/storage'
import type { ExtraPaymentSettings, ParsedStatement } from './lib/types'

const AmortizationChart = lazy(() =>
  import('./components/AmortizationChart').then((m) => ({ default: m.AmortizationChart })),
)

const DEFAULT_SETTINGS: ExtraPaymentSettings = {
  monthlyBasePayment: 0,
  extraMonthly: 0,
  extraAnnual: 0,
  extraAnnualMonth: 12,
}

const EMPTY_STATEMENT: ParsedStatement = {
  credit: {},
  movements: [],
  warnings: [],
  source: 'manual',
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function App() {
  const [statement, setStatement] = useState<ParsedStatement | null>(null)
  const [settings, setSettings] = useState<ExtraPaymentSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      setStatement(stored.statement)
      setSettings(stored.settings)
    }
  }, [])

  useEffect(() => {
    if (statement) saveToStorage(statement, settings)
  }, [statement, settings])

  // Keep "pago mensual base" in sync with the credit's official mensualidad until the
  // user has set one explicitly — covers both the PDF flow and manual entry, where the
  // mensualidad is typed into a separate card further down the page.
  const officialMensualidad = statement?.credit.mensualidadConRelacionLaboral ?? statement?.credit.mensualidadSinRelacionLaboral
  useEffect(() => {
    if (officialMensualidad) {
      setSettings((s) => (s.monthlyBasePayment === 0 ? { ...s, monthlyBasePayment: officialMensualidad } : s))
    }
  }, [officialMensualidad])

  async function handleFile(file: File) {
    setLoading(true)
    setError(null)
    try {
      const parsed = await parseInfonavitStatement(file)
      setStatement(parsed)
      setSettings(DEFAULT_SETTINGS)
    } catch (e) {
      console.error(e)
      setError('No pudimos leer ese PDF. Verifica que sea tu Estado de Cuenta Histórico de INFONAVIT.')
    } finally {
      setLoading(false)
    }
  }

  function handleManualEntry() {
    setError(null)
    setStatement(EMPTY_STATEMENT)
    setSettings(DEFAULT_SETTINGS)
  }

  function handleReset() {
    clearStorage()
    setStatement(null)
    setSettings(DEFAULT_SETTINGS)
    setError(null)
  }

  const simParams = useMemo(() => {
    const c = statement?.credit ?? {}
    return {
      startDate: c.fechaCorte ?? todayIso(),
      startBalance: c.saldoCapital ?? 0,
      annualRatePct: c.tasaInteres ?? 0,
    }
  }, [statement])

  const comparison = useMemo(
    () => compareScenarios(simParams.startDate, simParams.startBalance, simParams.annualRatePct, settings),
    [simParams, settings],
  )

  const isEmptyCredit = statement ? Object.keys(statement.credit).length === 0 : false

  return (
    <div className="min-h-screen">
      <header className="border-b border-b-slate-200 border-t-4 border-t-brand-red bg-white dark:border-b-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">Calculadora INFONAVIT</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Analiza tu crédito y planea cómo liquidarlo antes
              </p>
            </div>
          </div>
          {statement && (
            <button
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Empezar de nuevo
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {!statement ? (
          <div className="py-12">
            <FileUpload onFile={handleFile} onManualEntry={handleManualEntry} loading={loading} error={error} />
          </div>
        ) : (
          <div className="space-y-6">
            {statement.source === 'manual' && (
              <div className="rounded-xl bg-brand-mist/40 px-4 py-3 text-sm text-slate-700 dark:bg-brand-blue/15 dark:text-slate-200">
                Estás capturando tus datos manualmente. Llena los campos de tu crédito abajo (los puedes encontrar en tu
                estado de cuenta o app de INFONAVIT) para que la simulación sea precisa.
              </div>
            )}

            {statement.warnings.length > 0 && (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                <p className="font-medium">Revisa estos puntos:</p>
                <ul className="mt-1 list-inside list-disc">
                  {statement.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <CreditSummary
              credit={statement.credit}
              onChange={(credit) => setStatement({ ...statement, credit })}
              startInEditMode={isEmptyCredit}
            />

            <ProgressCard credit={statement.credit} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
              <ExtraPaymentControls
                settings={settings}
                onChange={setSettings}
                suggestedBase={statement.credit.mensualidadConRelacionLaboral}
              />
              <Suspense
                fallback={
                  <div className="flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 sm:h-96">
                    Cargando gráfica…
                  </div>
                }
              >
                <AmortizationChart
                  movements={statement.movements}
                  comparison={comparison}
                  startDate={simParams.startDate}
                  startBalance={simParams.startBalance}
                />
              </Suspense>
            </div>

            <ComparisonSummaryCard comparison={comparison} />

            <StrategyTable
              startDate={simParams.startDate}
              startBalance={simParams.startBalance}
              annualRatePct={simParams.annualRatePct}
              settings={settings}
            />

            <GoalSeekTool
              startDate={simParams.startDate}
              startBalance={simParams.startBalance}
              annualRatePct={simParams.annualRatePct}
              settings={settings}
            />

            <MovementsTable
              movements={statement.movements}
              onChange={(movements) => setStatement({ ...statement, movements })}
            />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Herramienta independiente, sin relación con INFONAVIT. Toda la información se procesa y guarda únicamente en tu
        navegador (localStorage); nada se envía a ningún servidor. Los cálculos son estimaciones y no sustituyen tu
        estado de cuenta oficial.
      </footer>
    </div>
  )
}
