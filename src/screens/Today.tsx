import { useState } from 'react'
import { useT } from '../i18n'
import { consistencyStreak, missedRecently, plannedFor, sessionsInWeek, useStore } from '../store'
import { TEMPLATES, minutesOf, type WorkoutTemplate } from '../data/program'
import { addDays, clock, longDay, nextWeekday, todayKey } from '../dates'
import { LoteriaCard } from '../components/Loteria'
import { Figure, SaturdayArt } from '../components/Figure'
import { WeighInSheet } from '../components/WeighInSheet'
import { IconCheck, IconPin, IconPlay } from '../components/Icons'
import type { Tab } from '../components/TabBar'

export function Today({ onStart, goTo }: { onStart: (id: WorkoutTemplate['id']) => void; goTo: (t: Tab) => void }) {
  const { t, lang } = useT()
  const { s, update } = useStore()
  const [weighing, setWeighing] = useState(false)
  const u = s.user!
  const today = todayKey()
  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Chicago' }).format(new Date()))
  const name = u.firstName || t('defaultName')
  const greet = hour < 12 ? t('greetMorning', { name }) : hour < 18 ? t('greetAfternoon', { name }) : t('greetEvening', { name })

  const locked = u.readiness === 'see_doctor'
  const planned = plannedFor(s, today)
  const doneToday = s.logs.some((l) => l.date === today)
  const restart = !doneToday && missedRecently(s, today) >= 2
  const sessionId: WorkoutTemplate['id'] | null = planned === 'SAT' ? 'SAT' : restart ? 'RESTART' : planned
  const ci = s.checkIns[today] ?? {}
  const weighedToday = s.weighIns.some((w) => w.date === today)
  const week = sessionsInWeek(s, today)
  const streak = consistencyStreak(s, today)

  let nextDay = addDays(today, 1)
  for (let i = 0; i < 7 && !plannedFor(s, nextDay); i++) nextDay = addDays(nextDay, 1)

  const sat = nextWeekday(today, 6, s.saturday.firstDate)
  const satCount = s.saturday.rsvps.length + (s.saturday.myRsvp ? 1 : 0)

  const toggle = (k: 'trained' | 'protein') =>
    update((d) => {
      const c = (d.checkIns[today] ??= {})
      c[k] = !c[k]
    })

  return (
    <div className="today">
      <header className="today-head">
        <p className="date">{longDay(today, lang)}</p>
        <h1 className="display">{greet}</h1>
      </header>

      {locked ? (
        <div className="callout callout-warn">
          <h3>{t('lockedTitle')}</h3>
          <p>{t('obDoctorBody')}</p>
          <button className="btn btn-secondary" onClick={() => update((d) => void (d.user!.readiness = 'cleared_by_doctor'))}>
            {t('lockedCta')}
          </button>
        </div>
      ) : sessionId ? (
        <SessionCard id={sessionId} done={doneToday} restart={restart} onStart={() => onStart(sessionId)} />
      ) : (
        <div className="rest-card">
          <p className="eyebrow-quiet">{t('restDay')}</p>
          <p className="rest-body">{t('restBody')}</p>
          <p className="rest-next">{t('nextUp', { day: longDay(nextDay, lang, true) })}</p>
        </div>
      )}

      <section className="checkin" aria-label={t('checkInTitle')}>
        <h2 className="h3">{t('checkInTitle')}</h2>
        <div className="checkin-row">
          <button className={`ci ${ci.trained || doneToday ? 'is-on' : ''}`} aria-pressed={!!(ci.trained || doneToday)} onClick={() => toggle('trained')}>
            <span className="ci-dot">{(ci.trained || doneToday) && <IconCheck />}</span>
            {t('ciTrained')}
          </button>
          <button className={`ci ${ci.protein ? 'is-on' : ''}`} aria-pressed={!!ci.protein} onClick={() => toggle('protein')}>
            <span className="ci-dot">{ci.protein && <IconCheck />}</span>
            {t('ciProtein')}
          </button>
          <button className={`ci ${weighedToday ? 'is-on' : ''}`} onClick={() => setWeighing(true)}>
            <span className="ci-dot">{weighedToday && <IconCheck />}</span>
            {t('ciWeigh')}
          </button>
        </div>
      </section>

      <section className="week-strip">
        <div>
          <p className="week-label">{t('thisWeek')}</p>
          <p className="week-count">
            <strong>{t('ofPlanned', { n: Math.min(week, 9) })}</strong>
          </p>
          <div className="week-pips" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < week ? 'is-on' : ''} />
            ))}
          </div>
        </div>
        <p className="week-streak">{streak === 0 ? t('firstWeek') : streak === 1 ? t('weekConsistent') : t('weeksConsistent', { n: streak })}</p>
      </section>

      {u.saturdayInvites && (
        <button className="sat-mini" onClick={() => goTo('saturday')}>
          <div className="sat-mini-art">
            <SaturdayArt />
          </div>
          <div className="sat-mini-text">
            <p className="sat-mini-title">{longDay(sat, lang)}</p>
            <p className="sat-mini-park">
              <IconPin /> {clock(s.saturday.time, lang)} · {s.saturday.park}
            </p>
            <p className="sat-mini-count">{t('satDadsIn', { n: satCount })}</p>
          </div>
          <span
            role="button"
            tabIndex={0}
            className={`sat-mini-rsvp ${s.saturday.myRsvp ? 'is-on' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              update((d) => void (d.saturday.myRsvp = !d.saturday.myRsvp))
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                update((d) => void (d.saturday.myRsvp = !d.saturday.myRsvp))
              }
            }}
          >
            {s.saturday.myRsvp ? t('satYoureIn') : t('satImIn')}
          </span>
        </button>
      )}

      <p className="fine">{t('freeNoSales')}</p>
      {weighing && <WeighInSheet onClose={() => setWeighing(false)} />}
    </div>
  )
}

function SessionCard({ id, done, restart, onStart }: { id: WorkoutTemplate['id']; done: boolean; restart: boolean; onStart: () => void }) {
  const { t, tb } = useT()
  const tpl = TEMPLATES[id]
  const [title, sub] = tb(tpl.name).split(' · ')
  const tone = id === 'SAT' ? 'mango' : id === 'B' ? 'chile' : id === 'C' ? 'nopal' : 'cielo'
  const art = id === 'SAT' ? <SaturdayArt /> : <Figure pattern={tpl.blocks[0].pattern} />
  const cardTitle = id === 'SAT' ? t('satCard') : sub ?? title
  return (
    <article className="session">
      {restart && (
        <div className="restart-note">
          <strong>{t('restartTitle')}</strong> {t('restartBody')}
        </div>
      )}
      <div className="session-row">
        <LoteriaCard num={id === 'SAT' ? 'S' : id === 'START' || id === 'RESTART' ? '★' : id} title={cardTitle} art={art} tone={tone} />
        <div className="session-info">
          <p className="eyebrow-quiet">{t('todaySession')}</p>
          <h2 className="h2">{title}</h2>
          <p className="muted">{tb(tpl.blurb)}</p>
          <p className="session-meta">
            {t('minutes', { n: minutesOf(tpl) })} · {t('blocksN', { n: tpl.blocks.length })}
          </p>
        </div>
      </div>
      {done ? (
        <div className="done-row">
          <span className="done-badge">
            <IconCheck /> {t('doneToday')}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onStart}>
            {t('doAgain')}
          </button>
        </div>
      ) : (
        <button className="btn btn-primary btn-start" onClick={onStart}>
          <IconPlay /> {t('start')}
        </button>
      )}
    </article>
  )
}
