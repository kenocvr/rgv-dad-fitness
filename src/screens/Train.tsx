import { useState } from 'react'
import { useT } from '../i18n'
import { equipOf, plannedFor, useStore } from '../store'
import { TEMPLATES, exerciseFor, minutesOf, type WorkoutTemplate } from '../data/program'
import { PATTERN_CARD, byId, type Exercise, type Pattern } from '../data/exercises'
import { addDays, longDay, todayKey, weekStart } from '../dates'
import { LoteriaCard } from '../components/Loteria'
import { Figure } from '../components/Figure'
import { Section, Sheet } from '../components/ui'
import { IconCheck, IconChevron, IconPlay } from '../components/Icons'

const PATTERNS: Pattern[] = ['squat', 'push', 'hinge', 'carry', 'core']
const TONES = ['cielo', 'chile', 'mango', 'nopal', 'cielo'] as const
const LEVEL_KEYS = ['levelBase', 'levelStandard', 'levelHarder'] as const

export function Train({ onStart }: { onStart: (id: WorkoutTemplate['id']) => void }) {
  const { t, tb, lang } = useT()
  const { s } = useStore()
  const [open, setOpen] = useState<Exercise | null>(null)
  const today = todayKey()
  const start = weekStart(today)
  const equip = equipOf(s.user!)
  const locked = s.user!.readiness === 'see_doctor'

  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    .map((d) => ({ d, id: plannedFor(s, d) }))
    .filter((x) => x.id)

  return (
    <div className="train">
      <h1 className="display">{t('trainTitle')}</h1>

      <Section title={t('trainWeek')}>
        <ul className="week-list">
          {week.map(({ d, id }) => {
            const tpl = TEMPLATES[id!]
            const done = s.logs.some((l) => l.date === d)
            const isToday = d === today
            return (
              <li key={d} className={`week-item ${isToday ? 'is-today' : ''} ${done ? 'is-done' : ''}`}>
                <div>
                  <p className="week-item-day">{longDay(d, lang)}</p>
                  <p className="week-item-name">{tb(tpl.name)}</p>
                </div>
                {done ? (
                  <span className="done-dot" aria-label={t('sessionDone')}>
                    <IconCheck />
                  </span>
                ) : (
                  !locked &&
                  d >= today && (
                    <button className="icon-btn icon-btn-solid" aria-label={`${t('start')}: ${tb(tpl.name)}`} onClick={() => onStart(id!)}>
                      <IconPlay />
                    </button>
                  )
                )}
              </li>
            )
          })}
        </ul>
      </Section>

      <button className="start-here" disabled={locked} onClick={() => onStart('START')}>
        <div>
          <p className="start-here-title">{t('trainStartHere')}</p>
          <p className="muted">{t('trainStartHereBody')}</p>
          <p className="session-meta">{t('minutes', { n: minutesOf(TEMPLATES.START) })}</p>
        </div>
        <IconChevron />
      </button>

      <Section title={t('trainLibrary')}>
        <p className="muted">{t('trainLibraryHint')}</p>
        <div className="deck">
          {PATTERNS.map((p, i) => {
            const ex = exerciseFor(p, equip)
            return (
              <button key={p} className="deck-card" onClick={() => setOpen(ex)} aria-label={tb(PATTERN_CARD[p].title)}>
                <LoteriaCard num={PATTERN_CARD[p].num} title={tb(PATTERN_CARD[p].title)} art={<Figure pattern={p} />} tone={TONES[i]} size="sm" />
                <span className="deck-level">{tb(ex.levels[s.levels[ex.id] ?? 1])}</span>
              </button>
            )
          })}
        </div>
      </Section>

      {open && <ExerciseSheet ex={open} onClose={() => setOpen(null)} />}
    </div>
  )

  function ExerciseSheet({ ex, onClose }: { ex: Exercise; onClose: () => void }) {
    const { update } = useStore()
    const lv = s.levels[ex.id] ?? 1
    const swap = byId(ex.swapId)
    return (
      <Sheet title={tb(PATTERN_CARD[ex.pattern].title)} onClose={onClose}>
        <div className="ex-demo">
          <Figure pattern={ex.pattern} />
        </div>
        <div className="levels levels-stack" role="radiogroup">
          {ex.levels.map((l, i) => (
            <button key={i} role="radio" aria-checked={lv === i} className={`level ${lv === i ? 'is-on' : ''}`} onClick={() => update((d) => void (d.levels[ex.id] = i as 0 | 1 | 2))}>
              <small>{t(LEVEL_KEYS[i])}</small>
              <span>{tb(l)}</span>
            </button>
          ))}
        </div>
        <h3 className="h3">{t('cuesLabel')}</h3>
        <ul className="cues">
          {ex.cues.map((c, i) => (
            <li key={i}>{tb(c)}</li>
          ))}
        </ul>
        {swap.id !== ex.id && (
          <p className="swap-line">
            <strong>{t('swapLabel')}:</strong> {tb(swap.levels[1])}
          </p>
        )}
      </Sheet>
    )
  }
}
