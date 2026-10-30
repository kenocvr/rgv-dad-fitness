// Every date in the app is an America/Chicago calendar day ("YYYY-MM-DD").
// Days are spelled out ("Saturday, November 7") because this user's week is crowded.
import type { Lang } from './i18n'

export const TZ = 'America/Chicago'

const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })

export function todayKey(now = new Date()): string {
  return keyFmt.format(now)
}

/** Noon UTC keeps a calendar day stable regardless of the viewer's zone. */
export function parseKey(key: string): Date {
  return new Date(`${key}T12:00:00Z`)
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(key: string): number {
  return parseKey(key).getUTCDay()
}

/** Monday that starts the week containing `key`. */
export function weekStart(key: string): string {
  const wd = weekday(key)
  return addDays(key, wd === 0 ? -6 : 1 - wd)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86_400_000)
}

const locale = (lang: Lang) => (lang === 'es' ? 'es-MX' : 'en-US')

/** `inSentence` keeps Spanish weekdays lowercase mid-sentence ("el sábado, 7 de noviembre"). */
export function longDay(key: string, lang: Lang, inSentence = false): string {
  const s = parseKey(key).toLocaleDateString(locale(lang), { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
  return lang === 'es' && !inSentence ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function shortDay(key: string, lang: Lang): string {
  return parseKey(key).toLocaleDateString(locale(lang), { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function weekdayName(wd: number, lang: Lang, style: 'long' | 'short' = 'short'): string {
  // 2026-11-01 is a Sunday
  const s = parseKey(addDays('2026-11-01', wd)).toLocaleDateString(locale(lang), { weekday: style, timeZone: 'UTC' })
  return s.charAt(0).toUpperCase() + s.slice(1).replace('.', '')
}

/** "8:00 AM" from "08:00" */
export function clock(hhmm: string, lang: Lang): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(Date.UTC(2026, 0, 1, h, m))
  return d.toLocaleTimeString(locale(lang), { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
}

/** Next date (today included) that falls on weekday `wd`, not before `notBefore`. */
export function nextWeekday(from: string, wd: number, notBefore?: string): string {
  let k = from
  if (notBefore && k < notBefore) k = notBefore
  while (weekday(k) !== wd) k = addDays(k, 1)
  return k
}
