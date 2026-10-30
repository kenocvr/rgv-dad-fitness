import type { Bi } from '../i18n'

/**
 * Admin-curated "rooms" from the Oct 27 outreach plan.
 * `confirm_first` entries came from research without independent re-verification:
 * they stay hidden from dads until the admin re-checks them and stamps a date.
 */
export interface DirectoryEntry {
  id: string
  org: string
  kind: Bi
  address?: string
  url?: string
  phone?: string
  status: 'listed' | 'confirm_first'
  note: Bi
}

export const DIRECTORY: DirectoryEntry[] = [
  {
    id: 'rgv-dads',
    org: 'RGV DADS',
    kind: { en: 'Fatherhood community', es: 'Comunidad de papás' },
    url: 'https://rgvdads.com',
    status: 'listed',
    note: { en: 'Meetups and summits for dads. Our seed community — show up first.', es: 'Reuniones y eventos para papás. Nuestra comunidad semilla: primero hay que ir.' },
  },
  {
    id: 'cf-ground-breakers',
    org: 'CrossFit Ground Breakers',
    kind: { en: 'Gym · 5 AM classes', es: 'Gimnasio · clases a las 5 AM' },
    address: '525 N 2nd St, McAllen',
    phone: '(956) 605-4616',
    status: 'listed',
    note: { en: 'Early classes, plus CF Kids for ages 6–12.', es: 'Clases temprano, y CF Kids para niños de 6 a 12.' },
  },
  {
    id: 'fit-lab',
    org: 'F.I.T. Lab',
    kind: { en: 'Gym · 5 AM crew', es: 'Gimnasio · grupo de las 5 AM' },
    address: '2702 N 10th St, McAllen',
    phone: '(956) 315-9017',
    status: 'listed',
    note: { en: 'Early-morning crew and transformation challenges.', es: 'Grupo madrugador y retos de transformación.' },
  },
  {
    id: 'valley-running',
    org: 'Valley Running Co',
    kind: { en: 'Run club hub', es: 'Club de corredores' },
    address: '1701 Dove Ave, McAllen',
    phone: '(956) 682-6917',
    status: 'listed',
    note: { en: 'Where the Valley run clubs meet up.', es: 'Donde se juntan los clubes de corredores del Valle.' },
  },
  {
    id: 'challenge-rgv',
    org: 'The Challenge-RGV',
    kind: { en: 'Community health season', es: 'Temporada de salud comunitaria' },
    phone: '956-755-0642',
    status: 'confirm_first',
    note: { en: 'Next season expected January 2027.', es: 'Próxima temporada esperada en enero de 2027.' },
  },
  {
    id: 'tu-salud',
    org: 'Tu Salud ¡Sí Cuenta!',
    kind: { en: 'Free bilingual classes', es: 'Clases bilingües gratis' },
    status: 'confirm_first',
    note: { en: 'Free community exercise classes across the Valley.', es: 'Clases de ejercicio gratis en todo el Valle.' },
  },
  {
    id: 'walk-with-a-doc',
    org: 'Walk with a Doc',
    kind: { en: 'Free walk with a clinician', es: 'Caminata gratis con un doctor' },
    address: 'Zinnia Park, McAllen',
    phone: '(956) 632-0750',
    status: 'confirm_first',
    note: { en: 'First Saturdays of the month.', es: 'Primeros sábados de cada mes.' },
  },
  {
    id: 'good-company',
    org: 'Good Company Movement',
    kind: { en: 'Free outdoor workout · Mission', es: 'Entreno gratis al aire libre · Mission' },
    status: 'confirm_first',
    note: { en: 'Free Thursday 6 AM workout.', es: 'Entreno gratis los jueves a las 6 AM.' },
  },
]
