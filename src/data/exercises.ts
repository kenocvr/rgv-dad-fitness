// Original exercise content. Structure is borrowed from mainstream full-body
// programming; every name and cue here is written for this app.
import type { Bi } from '../i18n'

export type Pattern = 'squat' | 'push' | 'hinge' | 'carry' | 'core'
export type Equip = 'none' | 'weights' | 'gym'

export interface Exercise {
  id: string
  pattern: Pattern
  equipment: Equip
  /** base / standard / harder */
  levels: [Bi, Bi, Bi]
  cues: Bi[]
  /** joint-friendly or no-equipment swap */
  swapId: string
}

const bi = (en: string, es: string): Bi => ({ en, es })

export const EXERCISES: Exercise[] = [
  // Squat
  {
    id: 'sq-bw',
    pattern: 'squat',
    equipment: 'none',
    levels: [bi('Sit-to-stand from a bench', 'Sentarse y pararse de la banca'), bi('Air squat', 'Sentadilla libre'), bi('Split squat', 'Sentadilla dividida')],
    cues: [bi('Feet shoulder-width, weight in your heels.', 'Pies al ancho de hombros, el peso en los talones.'), bi('Chest proud, knees track over toes.', 'Pecho arriba, rodillas en línea con los pies.')],
    swapId: 'sq-bw',
  },
  {
    id: 'sq-goblet',
    pattern: 'squat',
    equipment: 'weights',
    levels: [bi('Goblet box squat', 'Sentadilla goblet a la banca'), bi('Goblet squat', 'Sentadilla goblet'), bi('Goblet squat, 3-second pause', 'Sentadilla goblet, pausa de 3 segundos')],
    cues: [bi('Hold the bell at your chest like a coffee mug.', 'Agarra la pesa al pecho como taza de café.'), bi('Elbows inside the knees at the bottom.', 'Codos por dentro de las rodillas abajo.')],
    swapId: 'sq-bw',
  },
  {
    id: 'sq-gym',
    pattern: 'squat',
    equipment: 'gym',
    levels: [bi('Leg press', 'Prensa de piernas'), bi('Goblet squat', 'Sentadilla goblet'), bi('Barbell back squat', 'Sentadilla con barra')],
    cues: [bi('Brace like someone is about to poke your belly.', 'Aprieta el abdomen como si te fueran a picar la panza.'), bi('Control down, drive up.', 'Baja con control, sube con fuerza.')],
    swapId: 'sq-bw',
  },
  // Push
  {
    id: 'pu-bw',
    pattern: 'push',
    equipment: 'none',
    levels: [bi('Incline push-up on a bench', 'Lagartija inclinada en la banca'), bi('Push-up', 'Lagartija'), bi('Feet-elevated push-up', 'Lagartija con pies elevados')],
    cues: [bi('Body in one straight line, head to heels.', 'Cuerpo en línea recta, de la cabeza a los talones.'), bi('Elbows at about 45°, not flared wide.', 'Codos a unos 45°, no abiertos.')],
    swapId: 'pu-bw',
  },
  {
    id: 'pu-wt',
    pattern: 'push',
    equipment: 'weights',
    levels: [bi('Half-kneeling press', 'Press arrodillado'), bi('Standing overhead press', 'Press de hombro de pie'), bi('Push press', 'Push press')],
    cues: [bi('Squeeze your glutes so your back stays flat.', 'Aprieta los glúteos para no arquear la espalda.'), bi('Finish with the weight over your ear, not in front.', 'Termina con la pesa sobre la oreja, no adelante.')],
    swapId: 'pu-bw',
  },
  {
    id: 'pu-gym',
    pattern: 'push',
    equipment: 'gym',
    levels: [bi('Machine chest press', 'Press de pecho en máquina'), bi('Dumbbell bench press', 'Press de banca con mancuernas'), bi('Barbell bench press', 'Press de banca con barra')],
    cues: [bi('Shoulder blades pinched and down.', 'Omóplatos juntos y hacia abajo.'), bi('Lower slow, press smooth.', 'Baja lento, empuja parejo.')],
    swapId: 'pu-bw',
  },
  // Hinge
  {
    id: 'hi-bw',
    pattern: 'hinge',
    equipment: 'none',
    levels: [bi('Glute bridge', 'Puente de glúteo'), bi('Hip thrust off a bench', 'Hip thrust en la banca'), bi('Single-leg hip thrust', 'Hip thrust a una pierna')],
    cues: [bi('Push through your heels and squeeze at the top.', 'Empuja con los talones y aprieta arriba.'), bi('Ribs down — lift with hips, not your low back.', 'Costillas abajo: sube con la cadera, no con la espalda baja.')],
    swapId: 'hi-bw',
  },
  {
    id: 'hi-wt',
    pattern: 'hinge',
    equipment: 'weights',
    levels: [bi('Deadlift from a box', 'Peso muerto desde un cajón'), bi('Romanian deadlift', 'Peso muerto rumano'), bi('Kettlebell swing', 'Swing con kettlebell')],
    cues: [bi('Push your hips back like closing a car door with your butt.', 'Lleva la cadera atrás como si cerraras la puerta del carro con las pompas.'), bi('Flat back, weight close to your legs.', 'Espalda plana, la pesa pegada a las piernas.')],
    swapId: 'hi-bw',
  },
  {
    id: 'hi-gym',
    pattern: 'hinge',
    equipment: 'gym',
    levels: [bi('Back extension', 'Extensión de espalda'), bi('Romanian deadlift', 'Peso muerto rumano'), bi('Trap-bar deadlift', 'Peso muerto con barra hexagonal')],
    cues: [bi('Hips back first, then stand tall.', 'Primero la cadera atrás, luego párate derecho.'), bi('Stop each rep before your back rounds.', 'Para antes de que se te curve la espalda.')],
    swapId: 'hi-bw',
  },
  // Carry
  {
    id: 'ca-bw',
    pattern: 'carry',
    equipment: 'none',
    levels: [bi('Backpack march', 'Caminata con mochila'), bi('Water-jug farmer carry', 'Cargar garrafones de agua'), bi('One-jug suitcase carry', 'Cargar un garrafón de un lado')],
    cues: [bi('Walk tall, shoulders away from your ears.', 'Camina derecho, hombros lejos de las orejas.'), bi('Short, quiet steps.', 'Pasos cortos y tranquilos.')],
    swapId: 'ca-bw',
  },
  {
    id: 'ca-wt',
    pattern: 'carry',
    equipment: 'weights',
    levels: [bi('Farmer carry, light', 'Caminata de granjero, ligera'), bi('Farmer carry', 'Caminata de granjero'), bi('Suitcase carry, one side', 'Carga de maleta, un lado')],
    cues: [bi('Grip hard, stand like you own the park.', 'Agarra fuerte, camina como dueño del parque.'), bi('Do not lean toward the weight.', 'No te ladees hacia la pesa.')],
    swapId: 'ca-bw',
  },
  // Core
  {
    id: 'co-bw',
    pattern: 'core',
    equipment: 'none',
    levels: [bi('Dead bug', 'Bicho muerto'), bi('Plank', 'Plancha'), bi('Plank shoulder taps', 'Plancha tocando hombros')],
    cues: [bi('Low back stays glued to the ground.', 'La espalda baja pegada al suelo.'), bi('Breathe out slowly and keep it tight.', 'Saca el aire despacio y mantén firme.')],
    swapId: 'co-bw',
  },
  {
    id: 'co-wt',
    pattern: 'core',
    equipment: 'weights',
    levels: [bi('Side plank on knees', 'Plancha lateral en rodillas'), bi('Side plank', 'Plancha lateral'), bi('Bear crawl', 'Gateo de oso')],
    cues: [bi('Hips high, one straight line.', 'Cadera arriba, una línea recta.'), bi('Slow is the point.', 'Lento es lo que cuenta.')],
    swapId: 'co-bw',
  },
]

export const byId = (id: string) => EXERCISES.find((e) => e.id === id)!

export const PATTERN_CARD: Record<Pattern, { num: number; title: Bi }> = {
  squat: { num: 1, title: bi('The Squat', 'La Sentadilla') },
  push: { num: 2, title: bi('The Push', 'El Empuje') },
  hinge: { num: 3, title: bi('The Hinge', 'El Peso Muerto') },
  carry: { num: 4, title: bi('The Carry', 'La Carga') },
  core: { num: 5, title: bi('The Plank', 'La Plancha') },
}

export const WARMUP: Bi[] = [
  bi('Arm circles, 30 seconds', 'Círculos de brazos, 30 segundos'),
  bi('Bodyweight good mornings, 10', 'Buenos días sin peso, 10'),
  bi('Easy squats, 10', 'Sentadillas suaves, 10'),
  bi('Walking lunges, 10 steps', 'Zancadas caminando, 10 pasos'),
  bi('Inchworms, 5', 'Gusanitos, 5'),
]
