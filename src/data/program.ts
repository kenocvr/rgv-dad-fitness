import type { Bi } from '../i18n'
import { EXERCISES, type Equip, type Exercise, type Pattern } from './exercises'

export interface Block {
  pattern: Pattern
  rounds: number
  workSec: number
  restSec: number
}

export interface WorkoutTemplate {
  id: 'A' | 'B' | 'C' | 'SAT' | 'START' | 'RESTART'
  name: Bi
  blurb: Bi
  warmupSec: number
  finisherSec: number
  finisher: Bi
  blocks: Block[]
  /** forces an equipment level (Saturday runs on bodyweight + kettlebells) */
  equipment?: Equip
}

const b = (pattern: Pattern, rounds = 6, workSec = 40, restSec = 20): Block => ({ pattern, rounds, workSec, restSec })

const FULL: Pattern[] = ['squat', 'push', 'hinge', 'carry', 'core']

export const TEMPLATES: Record<WorkoutTemplate['id'], WorkoutTemplate> = {
  A: {
    id: 'A',
    name: { en: 'Day A · Strong legs first', es: 'Día A · Primero las piernas' },
    blurb: { en: 'Full body, squat-led. Steady 40/20 intervals.', es: 'Cuerpo completo, empieza con sentadilla. Intervalos 40/20.' },
    warmupSec: 300,
    finisherSec: 300,
    finisher: { en: 'Easy walk, nose breathing', es: 'Caminata suave, respirando por la nariz' },
    blocks: FULL.map((p) => b(p)),
  },
  B: {
    id: 'B',
    name: { en: 'Day B · Back and hips', es: 'Día B · Espalda y cadera' },
    blurb: { en: 'Full body, hinge-led. Carry before you push.', es: 'Cuerpo completo, empieza con peso muerto. Carga antes de empujar.' },
    warmupSec: 300,
    finisherSec: 300,
    finisher: { en: 'Easy walk, nose breathing', es: 'Caminata suave, respirando por la nariz' },
    blocks: (['hinge', 'push', 'squat', 'carry', 'core'] as Pattern[]).map((p) => b(p)),
  },
  C: {
    id: 'C',
    name: { en: 'Day C · Quick rounds', es: 'Día C · Rondas rápidas' },
    blurb: { en: 'Full body, shorter 30/15 rounds. Move with purpose.', es: 'Cuerpo completo, rondas cortas 30/15. Muévete con intención.' },
    warmupSec: 300,
    finisherSec: 300,
    finisher: { en: 'Carry ladder, then walk it off', es: 'Escalera de carga, luego a caminar' },
    blocks: FULL.map((p) => b(p, 8, 30, 15)),
  },
  SAT: {
    id: 'SAT',
    name: { en: 'Saturday 8 AM · The crew circuit', es: 'Sábado 8 AM · El circuito del grupo' },
    blurb: { en: 'Bodyweight + kettlebells, scalable to anyone. Ends with the circle.', es: 'Peso corporal + kettlebells, para cualquier nivel. Termina con el círculo.' },
    warmupSec: 300,
    finisherSec: 300,
    finisher: { en: 'Partner carry relay, kids can cheer', es: 'Relevo de carga en parejas, los niños echan porras' },
    blocks: FULL.map((p) => b(p)),
    equipment: 'weights',
  },
  START: {
    id: 'START',
    name: { en: 'Start Here · 25 minutes', es: 'Empieza Aquí · 25 minutos' },
    blurb: { en: 'Fewer moves, easy pace. The goal is finishing, not suffering.', es: 'Menos ejercicios, ritmo suave. La meta es terminar, no sufrir.' },
    warmupSec: 300,
    finisherSec: 300,
    finisher: { en: 'Easy walk', es: 'Caminata suave' },
    blocks: (['squat', 'push', 'core'] as Pattern[]).map((p) => b(p, 4, 30, 30)),
  },
  RESTART: {
    id: 'RESTART',
    name: { en: 'Restart · Welcome back', es: 'De vuelta · Bienvenido otra vez' },
    blurb: { en: 'Missed a couple of days? Happens to every dad. 20 easy minutes.', es: '¿Se te pasaron unos días? Le pasa a todo papá. 20 minutos suaves.' },
    warmupSec: 240,
    finisherSec: 240,
    finisher: { en: 'Easy walk', es: 'Caminata suave' },
    blocks: (['squat', 'hinge', 'core'] as Pattern[]).map((p) => b(p, 3, 30, 30)),
  },
}

export const WEEK_TEMPLATES: WorkoutTemplate['id'][] = ['A', 'B', 'C']

export function minutesOf(t: WorkoutTemplate) {
  const blocks = t.blocks.reduce((s, x) => s + x.rounds * (x.workSec + x.restSec), 0)
  return Math.round((t.warmupSec + blocks + t.finisherSec) / 60)
}

/** Pick the exercise for a movement pattern given the dad's equipment. */
export function exerciseFor(pattern: Pattern, equip: Equip): Exercise {
  const order: Equip[] = equip === 'gym' ? ['gym', 'weights', 'none'] : equip === 'weights' ? ['weights', 'none'] : ['none']
  for (const e of order) {
    const hit = EXERCISES.find((x) => x.pattern === pattern && x.equipment === e)
    if (hit) return hit
  }
  return EXERCISES.find((x) => x.pattern === pattern)!
}
