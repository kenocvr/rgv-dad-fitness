import { useState } from 'react'
import { useT } from '../i18n'
import { consistencyStreak, sessionsInWeek, trend, useStore } from '../store'
import { EXERCISES, PATTERN_CARD } from '../data/exercises'
import { addDays, daysBetween, shortDay, todayKey, weekStart } from '../dates'
import { Section } from '../components/ui'
import { WeighInSheet } from '../components/WeighInSheet'

const LEVEL_KEYS = ['levelBase', 'levelStandard', 'levelHarder'] as const

export function Progress() {
  const { t, tb, lang } = useT()
  const { s } = useStore()
  const [weighing, setWeighing] = useState(false)
  const today = todayKey()
  const pts = trend(s.weighIns).filter((p) => daysBetween(p.date, today) <= 84)

  // Verdict-free trend message: compare 7-day averages at least 2 weeks apart.
  let message = ''
  if (pts.length >= 6 && daysBetween(pts[0].date, pts.at(-1)!.date) >= 14) {
    const last = pts.at(-1)!
    const first = pts[0]
    const diff = last.avg - first.avg
    const weeks = Math.max(2, Math.round(daysBetween(first.date, last.date) / 7))
    message = diff < -0.5 ? t('progTrendDown', { n: Math.abs(diff).toFixed(1), w: weeks }) : diff > 0.5 ? t('progTrendUp') : t('progTrendFlat')
  }

  const weeks = Array.from({ length: 8 }, (_, i) => addDays(weekStart(today), -7 * (7 - i)))
  const perWeek = weeks.map((w) => sessionsInWeek(s, w))
  const streak = consistencyStreak(s, today)
  const strength = EXERCISES.filter((e) => s.strength[e.id]).map((e) => ({ e, v: s.strength[e.id] }))

  return (
    <div className="progress">
      <h1 className="display">{t('progTitle')}</h1>

      <Section title={t('progWeight')} aside={<button className="btn btn-secondary btn-sm" onClick={() => setWeighing(true)}>{t('progAddWeigh')}</button>}>
        {pts.length < 3 ? (
          <p className="empty">{t('progNoWeight')}</p>
        ) : (
          <>
            {message && <p className="trend-msg">{message}</p>}
            <TrendChart pts={pts} />
            <div className="legend">
              <span className="legend-line">{t('progAvg')}</span>
              <span className="legend-dot">{t('progReadings')}</span>
            </div>
          </>
        )}
        <p className="protocol">{t('progProtocol')}</p>
      </Section>

      <Section title={t('progStreak')}>
        <div className="streak">
          <span className="streak-num">{streak}</span>
          <span className="muted">{t('progStreakBody')}</span>
        </div>
        <h3 className="h3">{t('progSessions')}</h3>
        <div className="bars" role="img" aria-label={`${t('progSessions')}: ${perWeek.join(', ')}`}>
          {perWeek.map((n, i) => (
            <div key={weeks[i]} className="bar-col">
              <span className="bar-n">{n}</span>
              <div className={`bar ${n >= 2 ? 'is-good' : ''}`} style={{ height: `${Math.min(n, 4) * 22 + 4}px` }} />
              <span className="bar-label">{shortDay(weeks[i], lang)}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('progStrength')}>
        {strength.length === 0 ? (
          <p className="empty">{t('progStrengthEmpty')}</p>
        ) : (
          <ul className="strength">
            {strength.map(({ e, v }) => (
              <li key={e.id}>
                <span className="strength-pattern">{tb(PATTERN_CARD[e.pattern].title)}</span>
                <span className="strength-name">{tb(e.levels[v.level])}</span>
                <span className="strength-meta">
                  {t(LEVEL_KEYS[v.level])}
                  {v.load ? ` · ${v.load}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p className="fine">{t('progDisclaimer')}</p>
      {weighing && <WeighInSheet onClose={() => setWeighing(false)} />}
    </div>
  )
}

function TrendChart({ pts }: { pts: ReturnType<typeof trend> }) {
  const { t, lang } = useT()
  const W = 340
  const H = 180
  const pad = { l: 34, r: 10, t: 12, b: 24 }
  const lo = Math.floor(Math.min(...pts.map((p) => p.lbs)) - 1)
  const hi = Math.ceil(Math.max(...pts.map((p) => p.lbs)) + 1)
  const d0 = pts[0].date
  const span = Math.max(1, daysBetween(d0, pts.at(-1)!.date))
  const x = (d: string) => pad.l + (daysBetween(d0, d) / span) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b)
  const step = hi - lo > 12 ? 5 : 2
  const ticks: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)} ${y(p.avg).toFixed(1)}`).join(' ')
  const area = `${line} L${x(pts.at(-1)!.date)} ${H - pad.b} L${x(d0)} ${H - pad.b} Z`
  const last = pts.at(-1)!
  const xTicks = [pts[0], pts[Math.floor(pts.length / 2)], last]
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${last.avg.toFixed(1)} lb`}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="chart-fill-top" />
          <stop offset="1" className="chart-fill-bottom" />
        </linearGradient>
      </defs>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="chart-grid" />
          <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" className="chart-tick">
            {v}
          </text>
        </g>
      ))}
      {xTicks.map((p, i) => (
        <text key={i} x={x(p.date)} y={H - 6} textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} className="chart-tick">
          {shortDay(p.date, lang)}
        </text>
      ))}
      <path d={area} fill="url(#trendFill)" />
      {pts.map((p) => (
        <circle key={p.date} cx={x(p.date)} cy={y(p.lbs)} r="2.4" className="chart-dot" />
      ))}
      <path d={line} className="chart-line" />
      <circle cx={x(last.date)} cy={y(last.avg)} r="5" className="chart-now" />
      <text x={W - pad.r} y={pad.t + 2} textAnchor="end" dominantBaseline="hanging" className="chart-now-label">
        {last.avg.toFixed(1)} {t('lb')}
      </text>
    </svg>
  )
}
