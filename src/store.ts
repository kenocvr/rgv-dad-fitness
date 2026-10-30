import { createContext, useContext } from 'react'
import type { Lang } from './i18n'
import type { Equip } from './data/exercises'
import type { WorkoutTemplate } from './data/program'
import { WEEK_TEMPLATES } from './data/program'
import { addDays, daysBetween, todayKey, weekStart, weekday } from './dates'

// Data model follows §12 of the handoff, kept on-device for the pilot.
// Nothing leaves the phone: no analytics, no third-party SDKs.

export type Goal = 'train3' | 'lose' | 'stronger' | 'keepup'
export type Effort = 'easy' | 'right' | 'too_much'
export type Location = 'home' | 'gym' | 'both'
export type EquipChoice = 'none' | 'dumbbells' | 'kettlebells' | 'gym'

export interface User {
  firstName: string
  lang: Lang
  city: string
  location: Location
  equipment: EquipChoice
  /** weekdays 0–6 for the 3 home/gym sessions (Saturday is separate) */
  days: number[]
  saturdayInvites: boolean
  readiness: 'clear' | 'see_doctor' | 'cleared_by_doctor'
  goal: Goal
  createdAt: string
}

export interface WorkoutLog {
  id: string
  templateId: WorkoutTemplate['id']
  date: string
  effort: Effort
  win?: string
}

export interface CheckIn {
  trained?: boolean
  protein?: boolean
}

export interface WeighIn {
  date: string
  lbs: number
  bodyFat?: number
}

export interface StrengthEntry {
  level: 0 | 1 | 2
  load?: string
  date: string
}

export interface CrewMember {
  name: string
  lang: Lang
  /** sessions logged this week */
  week: number
  checkedInToday: boolean
  role: 'member' | 'leader'
}

export interface Recap {
  date: string
  attendance: number
  win: string
}

export interface Saturday {
  park: string
  address: string
  time: string
  firstDate: string
  leader: string
  /** first names of dads who RSVP'd for the upcoming Saturday (excluding me) */
  rsvps: string[]
  myRsvp: boolean
  attendance: string[]
  recaps: Recap[]
}

export interface State {
  user: User | null
  admin: boolean
  sunMode: boolean
  voice: boolean
  levels: Record<string, 0 | 1 | 2>
  swaps: Record<string, boolean>
  logs: WorkoutLog[]
  checkIns: Record<string, CheckIn>
  weighIns: WeighIn[]
  strength: Record<string, StrengthEntry>
  saturday: Saturday
  crew: { name: string; chatUrl: string; members: CrewMember[] }
  directoryChecked: Record<string, string>
}

export const KEY = 'rgv-dad-fitness:v1'

export function freshState(): State {
  return {
    user: null,
    admin: false,
    sunMode: false,
    voice: true,
    levels: {},
    swaps: {},
    logs: [],
    checkIns: {},
    weighIns: [],
    strength: {},
    saturday: {
      park: "Fireman's Park",
      address: '201 N 1st St, McAllen',
      time: '08:00',
      firstDate: '2026-11-07',
      leader: 'Carlos',
      rsvps: [],
      myRsvp: false,
      attendance: [],
      recaps: [],
    },
    crew: { name: 'Los Madrugadores', chatUrl: '', members: [] },
    directoryChecked: {},
  }
}

export function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...freshState(), ...JSON.parse(raw) }
  } catch {
    /* storage unavailable: run in memory */
  }
  return freshState()
}

export function save(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export interface Store {
  s: State
  update: (fn: (draft: State) => void) => void
  replace: (next: State) => void
}

export const StoreContext = createContext<Store>(null as unknown as Store)
export const useStore = () => useContext(StoreContext)

// ---------- derived views (never stored) ----------

export function equipOf(u: User): Equip {
  if (u.equipment === 'gym' && u.location !== 'home') return 'gym'
  if (u.equipment === 'none') return 'none'
  return 'weights'
}

/** Which session (if any) is planned for a given day. */
export function plannedFor(s: State, key: string): WorkoutTemplate['id'] | null {
  if (!s.user) return null
  const wd = weekday(key)
  if (wd === 6 && s.user.saturdayInvites && key >= s.saturday.firstDate) return 'SAT'
  const sorted = [...s.user.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  const idx = sorted.indexOf(wd)
  if (idx === -1) return null
  // Dads in their first two weeks get the on-ramp.
  if (daysBetween(s.user.createdAt, key) < 14 && s.user.goal !== 'stronger' && s.logs.length < 6) return 'START'
  return WEEK_TEMPLATES[idx % 3]
}

export function sessionsInWeek(s: State, anyDayInWeek: string): number {
  const start = weekStart(anyDayInWeek)
  const end = addDays(start, 6)
  return s.logs.filter((l) => l.date >= start && l.date <= end).length
}

/** Weeks in a row (ending this week, or last week if this one is still young) with ≥2 sessions. */
export function consistencyStreak(s: State, today = todayKey()): number {
  let wk = weekStart(today)
  let streak = 0
  if (sessionsInWeek(s, wk) < 2) wk = addDays(wk, -7)
  while (sessionsInWeek(s, wk) >= 2) {
    streak++
    wk = addDays(wk, -7)
  }
  return streak
}

/** Planned days that passed with nothing logged since the last session. */
export function missedRecently(s: State, today = todayKey()): number {
  if (!s.user) return 0
  const last = s.logs.length ? s.logs.map((l) => l.date).sort().at(-1)! : s.user.createdAt
  let missed = 0
  for (let k = addDays(last, 1); k < today; k = addDays(k, 1)) {
    const p = plannedFor(s, k)
    if (p && p !== 'SAT') missed++
  }
  return missed
}

/** 7-day trailing average for each weigh-in. */
export function trend(weighIns: WeighIn[]) {
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.map((w) => {
    const window = sorted.filter((x) => x.date <= w.date && daysBetween(x.date, w.date) < 7)
    const avg = window.reduce((t, x) => t + x.lbs, 0) / window.length
    return { ...w, avg }
  })
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}
