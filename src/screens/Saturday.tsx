import { useState } from 'react'
import { useT } from '../i18n'
import { useStore } from '../store'
import { TEMPLATES } from '../data/program'
import { PATTERN_CARD } from '../data/exercises'
import { exerciseFor } from '../data/program'
import { clock, longDay, nextWeekday, parseKey, shortDay, todayKey } from '../dates'
import { LoteriaCard } from '../components/Loteria'
import { SaturdayArt } from '../components/Figure'
import { Section } from '../components/ui'
import { IconCheck, IconPin } from '../components/Icons'

export function Saturday() {
  const { t, tb, lang } = useT()
  const { s, update } = useStore()
  const sat = s.saturday
  const today = todayKey()
  const date = nextWeekday(today, 6, sat.firstDate)
  const me = s.user!.firstName || t('crewYou')
  const names = [...(sat.myRsvp ? [me] : []), ...sat.rsvps]
  const tpl = TEMPLATES.SAT
  const month = parseKey(today).getUTCMonth() + 1
  const hot = month >= 4 && month <= 10
  const isLeader = s.admin || sat.leader === s.user!.firstName
  const [win, setWin] = useState('')
  const [posted, setPosted] = useState(false)

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${sat.park}, ${sat.address}`)}`

  return (
    <div className="saturday">
      <div className="sat-hero">
        <LoteriaCard num="S" title={t('satCard')} art={<SaturdayArt />} size="lg" />
        <div className="sat-hero-text">
          <p className="date">{longDay(date, lang)}</p>
          <h1 className="display sat-time">{clock(sat.time, lang)}</h1>
          <a className="sat-park" href={mapsUrl} target="_blank" rel="noreferrer">
            <IconPin />
            <span>
              {sat.park}
              <small>{sat.address}</small>
            </span>
          </a>
          <p className="sat-free">{t('satFree')}</p>
        </div>
      </div>

      <button className={`btn btn-lg btn-rsvp ${sat.myRsvp ? 'is-in' : 'btn-primary'}`} onClick={() => update((d) => void (d.saturday.myRsvp = !d.saturday.myRsvp))}>
        {sat.myRsvp ? (
          <>
            <IconCheck /> {t('satYoureIn')}
          </>
        ) : (
          t('satImIn')
        )}
      </button>
      {sat.myRsvp && (
        <button className="link-btn" onClick={() => update((d) => void (d.saturday.myRsvp = false))}>
          {t('satCantMake')}
        </button>
      )}

      <Section title={t('satWhosIn')} aside={<span className="count-badge">{names.length}</span>}>
        <ul className="faces">
          {names.map((n) => (
            <li key={n} className="face">
              <span className="face-dot">{n[0]}</span>
              {n}
            </li>
          ))}
        </ul>
        <p className="muted small">
          {t('satLeader')}: <strong>{sat.leader}</strong>
        </p>
      </Section>

      {hot && (
        <div className="callout callout-heat">
          <h3>{t('satHeatTitle')}</h3>
          <p>{t('satHeat')}</p>
        </div>
      )}

      <Section title={t('satPlan')}>
        <ol className="plan">
          <li>
            <span className="plan-min">5′</span>
            <span>{t('satWarmup')}</span>
          </li>
          {tpl.blocks.map((b) => (
            <li key={b.pattern}>
              <span className="plan-min">{Math.round((b.rounds * (b.workSec + b.restSec)) / 60)}′</span>
              <span>
                <strong>{tb(PATTERN_CARD[b.pattern].title)}</strong> · {tb(exerciseFor(b.pattern, 'weights').levels[1])}
              </span>
            </li>
          ))}
          <li>
            <span className="plan-min">5′</span>
            <span>
              {t('satFinisher')}: {tb(tpl.finisher)}
            </span>
          </li>
          <li className="plan-circle">
            <span className="plan-min">2′</span>
            <span>
              <strong>{t('satCircle')}</strong> — {t('satCircleBody')}
            </span>
          </li>
        </ol>
      </Section>

      {isLeader && (
        <Section title={t('satLeaderView')}>
          <p className="muted">{t('satCirclePrompt')}</p>
          <h3 className="h3">{t('satAttendance')}</h3>
          <p className="muted small">{t('satAttendanceHint')}</p>
          <div className="chips">
            {names.map((n) => {
              const on = sat.attendance.includes(n)
              return (
                <button
                  key={n}
                  className={`chip ${on ? 'is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() =>
                    update((d) => {
                      const a = d.saturday.attendance
                      d.saturday.attendance = a.includes(n) ? a.filter((x) => x !== n) : [...a, n]
                    })
                  }
                >
                  {n}
                </button>
              )
            })}
          </div>
          <label className="field">
            <span>{t('satRecapWin')}</span>
            <input className="input" value={win} onChange={(e) => setWin(e.target.value)} maxLength={140} />
          </label>
          <button
            className="btn btn-secondary"
            disabled={posted || sat.attendance.length === 0}
            onClick={() => {
              update((d) => {
                d.saturday.recaps.unshift({ date, attendance: d.saturday.attendance.length, win: win.trim() })
                d.saturday.attendance = []
              })
              setWin('')
              setPosted(true)
            }}
          >
            {posted ? t('satRecapPosted') : t('satPostRecap')}
          </button>
        </Section>
      )}

      <Section title={t('satPast')}>
        {sat.recaps.length === 0 ? (
          <p className="empty">{t('satNoPast', { day: longDay(sat.firstDate, lang, true) })}</p>
        ) : (
          <ul className="recaps">
            {sat.recaps.map((r, i) => (
              <li key={i}>
                <span className="recap-date">{shortDay(r.date, lang)}</span>
                <span>
                  <strong>{t('satShowedUp', { n: r.attendance })}</strong>
                  {r.win && <span className="recap-win">“{r.win}”</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
