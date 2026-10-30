import type { Pattern } from '../data/exercises'

// Two-pose line figures, side view. The poses cross-fade so each card shows the
// movement itself — a tiny looping demo that works offline and costs no data.
type Pose = string[] // svg path "d" strings; first entry is the head as "c x y"

const P: Record<Pattern, [Pose, Pose]> = {
  squat: [
    ['c 52 16', 'M52 24 L52 56', 'M52 30 L46 52', 'M52 56 L50 74 L50 92'],
    ['c 43 37', 'M46 45 L60 66', 'M47 49 L26 53', 'M60 66 L40 70 L46 92'],
  ],
  push: [
    ['c 22 50', 'M30 57 L60 68 L88 84', 'M30 57 L30 84'],
    ['c 21 69', 'M30 75 L60 79 L88 84', 'M30 75 L42 68 L32 84'],
  ],
  hinge: [
    ['c 52 16', 'M52 24 L52 56', 'M52 30 L52 56', 'M52 56 L50 74 L50 92', 'R 47 58'],
    ['c 26 35', 'M34 41 L62 54', 'M34 41 L36 68', 'M62 54 L57 73 L57 92', 'R 31 70'],
  ],
  carry: [
    ['c 52 16', 'M52 24 L52 56', 'M52 30 L54 58', 'M52 56 L42 92', 'M52 56 L62 92', 'R 49 60'],
    ['c 52 15', 'M52 23 L52 55', 'M52 29 L54 57', 'M52 55 L50 74 L50 92', 'M52 55 L55 74 L53 92', 'R 49 59'],
  ],
  core: [
    ['c 22 63', 'M30 70 L59 76 L88 84', 'M30 70 L30 84 L14 84'],
    ['c 22 61', 'M30 68 L59 74 L88 84', 'M30 68 L30 84 L14 84'],
  ],
}

function draw(pose: Pose) {
  return pose.map((d, i) => {
    if (d.startsWith('c ')) {
      const [, x, y] = d.split(' ').map(Number)
      return <circle key={i} cx={x} cy={y} r="7" className="fig-head" />
    }
    if (d.startsWith('R ')) {
      const [, x, y] = d.split(' ').map(Number)
      return <rect key={i} x={x} y={y} width="11" height="12" rx="3" className="fig-bell" />
    }
    return <path key={i} d={d} />
  })
}

export function Figure({ pattern, animate = true }: { pattern: Pattern; animate?: boolean }) {
  const [a, b] = P[pattern]
  return (
    <svg viewBox="0 0 100 100" className={`figure ${animate ? 'is-animated' : ''}`} aria-hidden="true">
      <line x1="6" y1="93" x2="94" y2="93" className="fig-ground" />
      <g className="fig-pose fig-a">{draw(a)}</g>
      <g className="fig-pose fig-b">{draw(b)}</g>
    </svg>
  )
}

export function SaturdayArt() {
  return (
    <svg viewBox="0 0 100 100" className="figure sat-art" aria-hidden="true">
      <circle cx="50" cy="84" r="34" className="sat-sun" />
      <g className="sat-rays">
        {[-64, -32, 0, 32, 64].map((deg) => (
          <line key={deg} x1="50" y1="40" x2="50" y2="31" transform={`rotate(${deg} 50 84)`} />
        ))}
      </g>
      <rect x="0" y="84" width="100" height="16" className="sat-ground" />
      <g className="sat-people">
        <circle cx="38" cy="38" r="6" />
        <path d="M38 45 L38 66 M38 66 L32 84 M38 66 L44 84 M38 50 L27 36 M38 51 L52 60" />
        <circle cx="58" cy="56" r="4.5" />
        <path d="M58 62 L58 73 M58 73 L55 84 M58 73 L61 84 M58 65 L52 60" />
      </g>
    </svg>
  )
}
