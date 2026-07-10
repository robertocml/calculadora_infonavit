import type { ExtraPaymentSettings, ParsedStatement } from './types'

const KEY = 'infonavit-calc-v1'

interface StoredData {
  statement: ParsedStatement
  settings: ExtraPaymentSettings
}

export function saveToStorage(statement: ParsedStatement, settings: ExtraPaymentSettings) {
  try {
    const data: StoredData = { statement, settings }
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — silently skip persistence.
  }
}

export function loadFromStorage(): StoredData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredData
  } catch {
    return null
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
