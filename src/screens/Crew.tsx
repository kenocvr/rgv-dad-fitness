import { useState } from 'react'
import { useT, type Lang } from '../i18n'
import { KEY, freshState, sessionsInWeek, useStore } from '../store'
import { DIRECTORY } from '../data/directory'
import { longDay, nextWeekday, shortDay, todayKey, weekdayName } from '../dates'
import { Choice, Section, Toggle } from '../components/ui'
import { IconChevron, IconPin, IconShare } from '../components/Icons'

export function Crew() {
  const [view, setView] = useState<'main' | 'admin'>('main')
  return view === 'admin' ? <Admin onBack={() => setView('main')} /> : <CrewMain openAdmin={() => setView('admin')} />
}

function CrewMain({ openAdmin }: { openAdmin: () => void }) {
  const { t, tb, lang } = useT()
  const { s, update, replace } = useStore()
  const [copied, setCopied] = useState(false)
  const today = todayKey()
  const me = s.user!
  const myWeek = sessionsInWeek(s, today)
  const myCheck = !!(s.checkIns[today]?.trained || s.checkIns[today]?.protein || s.weighIns.some((w) => w.date === today))
  const sat = nextWeekday(today, 6, s.saturday.firstDate)
  const invite = t('inviteMsg', { park: s.saturday.park, day: longDay(sat, lang, true) })
  const directory = DIRECTORY.filter((d) => d.status === 'listed' || s.directoryChecked[d.id])

  const sendInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: invite })
        return
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(invite)
      setCopied(true)
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(invite)}`, '_blank')
    }
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `rgv-dad-fitness-${today}.json`
    a.click()
  }

  return (
    <div className="crew">
      <h1 className="display">{s.crew.members.length ? s.crew.name : t('crewTitle')}</h1>

      <Section title={t('crewWeek')}>
        {s.crew.members.length === 0 ? (
          <p className="empty">{t('crewEmpty')}</p>
        ) : (
          <ul className="crew-list">
            {[{ name: me.firstName || t('crewYou'), week: myWeek, checkedInToday: myCheck, role: 'member' as const, lang: me.lang, isMe: true }, ...s.crew.members.map((m) => ({ ...m, isMe: false }))].map((m) => (
              <li key={m.name} className={`crew-row ${m.isMe ? 'is-me' : ''}`}>
                <span className="face-dot">{m.name[0]}</span>
                <div className="crew-who">
                  <p>
                    {m.name}
                    {m.role === 'leader' && <span className="tag">{t('leaderTag')}</span>}
                  </p>
                  <small>{m.checkedInToday ? t('crewCheckedIn') : t('crewNotYet')}</small>
                </div>
                <div className="crew-pips" aria-label={t('ofPlanned', { n: m.week })}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={i < m.week ? 'is-on' : ''} />
                  ))}
                </div>
                {!m.isMe && (
                  <a className="nudge" href={`https://wa.me/?text=${encodeURIComponent(t('crewNudgeMsg'))}`} target="_blank" rel="noreferrer" aria-label={`${t('crewNudge')}: ${m.name}`}>
                    💪
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        {s.crew.chatUrl && (
          <a className="btn btn-secondary" href={s.crew.chatUrl} target="_blank" rel="noreferrer">
            {t('crewOpenChat')}
          </a>
        )}
      </Section>

      <section className="invite">
        <h2 className="h2">{t('inviteTitle')}</h2>
        <p className="muted">{t('inviteBody')}</p>
        <blockquote className="invite-msg">{invite}</blockquote>
        <button className="btn btn-primary" onClick={sendInvite}>
          <IconShare /> {t('inviteSend')}
        </button>
        <p className="fine">{copied ? t('inviteCopied') : t('inviteNote')}</p>
      </section>

      <Section title={t('dirTitle')}>
        <p className="muted small">{t('dirHint')}</p>
        <ul className="directory">
          {directory.map((d) => (
            <li key={d.id}>
              <div className="dir-head">
                <p className="dir-org">{d.url ? <a href={d.url} target="_blank" rel="noreferrer">{d.org}</a> : d.org}</p>
                <span className="dir-kind">{tb(d.kind)}</span>
              </div>
              <p className="dir-note">{tb(d.note)}</p>
              <p className="dir-meta">
                {d.address && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(d.address)}`} target="_blank" rel="noreferrer">
                    <IconPin /> {d.address}
                  </a>
                )}
                {d.phone && <a href={`tel:${d.phone.replace(/[^\d]/g, '')}`}>{d.phone}</a>}
              </p>
              <p className="dir-stamp">{s.directoryChecked[d.id] ? t('dirChecked', { day: shortDay(s.directoryChecked[d.id], lang) }) : t('dirNotChecked')}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('settingsTitle')}>
        <div className="settings">
          <div className="setting">
            <span>{t('setLanguage')}</span>
            <Choice
              columns={2}
              value={me.lang}
              onChange={(l: Lang) => update((d) => void (d.user!.lang = l))}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
              ]}
            />
          </div>
          <div className="setting">
            <span>{t('setDays')}</span>
            <Choice
              multi
              columns={6}
              value={me.days}
              onChange={(d: number) =>
                update((x) => {
                  const cur = x.user!.days
                  x.user!.days = cur.includes(d) ? cur.filter((v) => v !== d) : cur.length < 3 ? [...cur, d] : cur
                })
              }
              options={[1, 2, 3, 4, 5, 0].map((d) => ({ value: d, label: weekdayName(d, lang) }))}
            />
          </div>
          <Toggle on={s.sunMode} onChange={(v) => update((d) => void (d.sunMode = v))} label={t('setSun')} hint={t('setSunHint')} />
          <Toggle on={s.voice} onChange={(v) => update((d) => void (d.voice = v))} label={t('setVoice')} />
          <Toggle on={s.admin} onChange={(v) => update((d) => void (d.admin = v))} label={t('setAdmin')} hint={t('setAdminHint')} />
          {s.admin && (
            <button className="row-link" onClick={openAdmin}>
              <span>{t('admTitle')}</span>
              <IconChevron />
            </button>
          )}
          <p className="fine">{t('setPrivacy')}</p>
          <div className="settings-actions">
            <button className="btn btn-ghost btn-sm" onClick={exportData}>
              {t('setExport')}
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (confirm(t('setDeleteConfirm'))) {
                  localStorage.removeItem(KEY)
                  replace(freshState())
                  history.replaceState(null, '', location.pathname)
                }
              }}
            >
              {t('setDelete')}
            </button>
          </div>
          <p className="fine">{t('obDisclaimer')}</p>
        </div>
      </Section>
    </div>
  )
}

function Admin({ onBack }: { onBack: () => void }) {
  const { t, tb, lang } = useT()
  const { s, update } = useStore()
  const [newName, setNewName] = useState('')
  const today = todayKey()
  const sat = s.saturday
  const set = (k: 'park' | 'address' | 'time' | 'firstDate' | 'leader', v: string) => update((d) => void (d.saturday[k] = v))

  // Pilot metrics (§11), computed from what this organizer's phone knows.
  const crew = s.crew.members
  const everyone = [{ lang: s.user!.lang, week: sessionsInWeek(s, today) }, ...crew]
  const consistent = everyone.filter((m) => m.week >= 2).length
  const spanish = everyone.filter((m) => m.lang === 'es').length
  const rsvps = sat.rsvps.length + (sat.myRsvp ? 1 : 0)
  const lastRecap = sat.recaps[0]
  const crewAvg = crew.length ? crew.reduce((a, m) => a + m.week, 0) / crew.length : 0

  return (
    <div className="admin">
      <button className="link-btn back" onClick={onBack}>
        ← {t('crewTitle')}
      </button>
      <h1 className="display">{t('admTitle')}</h1>

      <Section title={t('admMetrics')}>
        <p className="muted small">{t('admMetricsHint')}</p>
        <div className="metrics">
          <Metric label={t('mRegulars')} value={String(crew.length + 1)} hint={t('mRegularsGoal')} />
          <Metric label={t('mConsistency')} value={`${consistent}/${everyone.length}`} hint={t('mConsistencyHint')} />
          <Metric label={t('mRsvp')} value={lastRecap ? `${lastRecap.attendance}/${rsvps}` : '—'} hint={lastRecap ? shortDay(lastRecap.date, lang) : t('mNoData')} />
          <Metric label={t('mSpanish')} value={`${Math.round((spanish / everyone.length) * 100)}%`} />
          <Metric label={t('mCrewEffect')} value={crew.length ? crewAvg.toFixed(1) : '—'} hint={t('mCrewEffectHint')} />
        </div>
      </Section>

      <Section title={t('admSaturday')}>
        <div className="form">
          <label className="field">
            <span>{t('admPark')}</span>
            <input className="input" value={sat.park} onChange={(e) => set('park', e.target.value)} />
          </label>
          <label className="field">
            <span>{t('admAddress')}</span>
            <input className="input" value={sat.address} onChange={(e) => set('address', e.target.value)} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>{t('admTime')}</span>
              <input className="input" type="time" value={sat.time} onChange={(e) => set('time', e.target.value)} />
            </label>
            <label className="field">
              <span>{t('admFirst')}</span>
              <input className="input" type="date" value={sat.firstDate} onChange={(e) => set('firstDate', e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>{t('admLeader')}</span>
            <input className="input" value={sat.leader} onChange={(e) => set('leader', e.target.value)} />
          </label>
        </div>
      </Section>

      <Section title={t('admCrew')}>
        <ul className="admin-crew">
          {crew.map((m) => (
            <li key={m.name}>
              <span>{m.name}</span>
              <button
                className={`chip ${m.role === 'leader' ? 'is-on' : ''}`}
                onClick={() => update((d) => d.crew.members.forEach((x) => (x.role = x.name === m.name && x.role !== 'leader' ? 'leader' : 'member')))}
              >
                {t('leaderTag')}
              </button>
              <button className="link-btn" onClick={() => update((d) => void (d.crew.members = d.crew.members.filter((x) => x.name !== m.name)))}>
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="add-row">
          <input className="input" value={newName} placeholder={t('admAddMember')} onChange={(e) => setNewName(e.target.value)} />
          <button
            className="btn btn-secondary"
            disabled={!newName.trim()}
            onClick={() => {
              update((d) => void d.crew.members.push({ name: newName.trim(), lang: 'en', week: 0, checkedInToday: false, role: 'member' }))
              setNewName('')
            }}
          >
            +
          </button>
        </div>
        <label className="field">
          <span>{t('admChat')}</span>
          <input className="input" value={s.crew.chatUrl} placeholder="https://chat.whatsapp.com/…" onChange={(e) => update((d) => void (d.crew.chatUrl = e.target.value))} />
        </label>
      </Section>

      <Section title={t('admDirectory')}>
        <p className="muted small">{t('admDirHint')}</p>
        <ul className="directory directory-admin">
          {DIRECTORY.map((d) => (
            <li key={d.id}>
              <div className="dir-head">
                <p className="dir-org">{d.org}</p>
                {d.status === 'confirm_first' && !s.directoryChecked[d.id] && <span className="tag tag-warn">{t('admConfirmFirst')}</span>}
              </div>
              <p className="dir-note">{tb(d.note)}</p>
              {s.directoryChecked[d.id] ? (
                <p className="dir-stamp">{t('dirChecked', { day: shortDay(s.directoryChecked[d.id], lang) })}</p>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => update((x) => void (x.directoryChecked[d.id] = today))}>
                  {t('admMarkChecked')}
                </button>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="metric">
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
      {hint && <small>{hint}</small>}
    </div>
  )
}
