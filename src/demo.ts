// Sample data for showcasing the app (open with ?demo=1).
// Crew names are made-up composites, not real people.
import { addDays, todayKey, weekday } from './dates'
import { freshState, type State, type WeighIn, type WorkoutLog } from './store'

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

export function demoState(today = todayKey()): State {
  const r = rng(7)
  const s = freshState()
  const start = addDays(today, -56)
  s.user = {
    firstName: 'Carlos',
    lang: 'en',
    city: 'McAllen',
    location: 'both',
    equipment: 'kettlebells',
    days: [1, 3, 5],
    saturdayInvites: true,
    readiness: 'clear',
    goal: 'stronger',
    createdAt: start,
  }
  s.admin = true

  // Morning weigh-ins: a steady downward trend with normal day-to-day water swings.
  const weighIns: WeighIn[] = []
  for (let i = 0; i <= 56; i++) {
    if (r() < 0.18 && i !== 56) continue
    const base = 190.5 - (13.5 * i) / 56
    const lbs = Math.round((base + (r() - 0.5) * 2.6) * 10) / 10
    weighIns.push({ date: addDays(start, i), lbs, bodyFat: i % 7 === 0 ? Math.round((21 - (5 * i) / 56) * 10) / 10 : undefined })
  }
  s.weighIns = weighIns

  const ids = ['A', 'B', 'C'] as const
  const logs: WorkoutLog[] = []
  let n = 0
  for (let k = start; k < today; k = addDays(k, 1)) {
    const wd = weekday(k)
    if ([1, 3, 5].includes(wd) && r() > 0.12) {
      logs.push({ id: `d${n}`, templateId: ids[n % 3], date: k, effort: r() > 0.7 ? 'too_much' : r() > 0.25 ? 'right' : 'easy' })
      n++
    }
  }
  logs.at(-1)!.win = 'Did my first full push-ups set without stopping'
  s.logs = logs

  s.checkIns = { [today]: { protein: true } }
  s.levels = { 'sq-goblet': 2, 'pu-wt': 1, 'hi-wt': 2, 'ca-wt': 1, 'co-wt': 1 }
  s.strength = {
    'sq-goblet': { level: 2, load: '53 lb', date: addDays(today, -2) },
    'hi-wt': { level: 2, load: '53 lb', date: addDays(today, -4) },
    'pu-wt': { level: 1, load: '35 lb', date: addDays(today, -2) },
    'ca-wt': { level: 1, load: '2 × 53 lb', date: addDays(today, -4) },
  }
  s.saturday.rsvps = ['Mike', 'Rudy', 'Joe', 'Beto', 'Ángel']
  s.saturday.myRsvp = true
  s.crew.members = [
    { name: 'Mike', lang: 'en', week: 2, checkedInToday: true, role: 'leader' },
    { name: 'Rudy', lang: 'es', week: 3, checkedInToday: true, role: 'member' },
    { name: 'Joe', lang: 'en', week: 1, checkedInToday: false, role: 'member' },
    { name: 'Beto', lang: 'es', week: 2, checkedInToday: false, role: 'member' },
  ]
  return s
}
