import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useT } from '../i18n'
import { equipOf, uid, useStore, type Effort } from '../store'
import { TEMPLATES, exerciseFor, type WorkoutTemplate } from '../data/program'
import { PATTERN_CARD, WARMUP, byId, type Exercise } from '../data/exercises'
import { todayKey } from '../dates'
import { Figure } from '../components/Figure'
import { IconPause, IconPlay, IconSkip, IconSwap, IconX } from '../components/Icons'

type Step =
  | { kind: 'warmup'; sec: number }
  | { kind: 'work' | 'rest'; sec: number; block: number; round: number }
  | { kind: 'finisher'; sec: number }

const LEVEL_KEYS = ['levelBase', 'levelStandard', 'levelHarder'] as const

// Audio + vibration cues so the phone can sit on a bench or in a pocket.
let ctx: AudioContext | null = null
function beep(freq: number, ms = 180) {
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + ms / 1000 + 0.05)
  } catch {
    /* audio unavailable */
  }
}

export function Player({ templateId, onExit }: { templateId: WorkoutTemplate['id']; onExit: () => void }) {
  const { t, tb, lang } = useT()
  const { s, update } = useStore()
  const tpl = TEMPLATES[templateId]
  const equip = tpl.equipment ?? equipOf(s.user!)

  const exercises: Exercise[] = useMemo(
    () =>
      tpl.blocks.map((b) => {
        const ex = exerciseFor(b.pattern, equip)
        return s.swaps[ex.id] ? byId(ex.swapId) : ex
      }),
    [tpl, equip, s.swaps],
  )

  const steps: Step[] = useMemo(() => {
    const out: Step[] = [{ kind: 'warmup', sec: tpl.warmupSec }]
    tpl.blocks.forEach((b, bi) => {
      for (let r = 1; r <= b.rounds; r++) {
        out.push({ kind: 'work', sec: b.workSec, block: bi, round: r })
        out.push({ kind: 'rest', sec: b.restSec, block: bi, round: r })
      }
    })
    out.push({ kind: 'finisher', sec: tpl.finisherSec })
    return out
  }, [tpl])

  const [idx, setIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(steps[0].sec)
  const endAt = useRef(0)
  const [finished, setFinished] = useState(false)

  const step = steps[idx]
  const level = (ex: Exercise) => s.levels[ex.id] ?? 1

  const speak = useCallback(
    (text: string) => {
      if (!s.voice || !('speechSynthesis' in window)) return
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang === 'es' ? 'es-MX' : 'en-US'
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
    },
    [s.voice, lang],
  )

  const announce = useCallback(
    (st: Step) => {
      navigator.vibrate?.(st.kind === 'work' ? [200, 80, 200] : 120)
      beep(st.kind === 'work' ? 880 : 520)
      if (st.kind === 'work') speak(t('plSpeakWork', { name: tb(exercises[st.block].levels[level(exercises[st.block])]) }))
      else if (st.kind === 'rest') speak(t('plSpeakRest'))
      else if (st.kind === 'finisher') speak(tb(tpl.finisher))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercises, speak, s.levels],
  )

  const goto = useCallback(
    (n: number, keepRunning = running) => {
      if (n >= steps.length) {
        setRunning(false)
        setFinished(true)
        beep(1046, 400)
        return
      }
      setIdx(n)
      setRemaining(steps[n].sec)
      endAt.current = Date.now() + steps[n].sec * 1000
      if (keepRunning) announce(steps[n])
    },
    [steps, running, announce],
  )

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 3 && left > 0) navigator.vibrate?.(40)
      if (left === 0) goto(idx + 1, true)
    }, 250)
    return () => clearInterval(id)
  }, [running, idx, goto])

  // Keep the screen awake while the session runs.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }
    if (running && nav.wakeLock) nav.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {})
    return () => void lock?.release()
  }, [running])

  const toggle = () => {
    if (running) setRunning(false)
    else {
      endAt.current = Date.now() + remaining * 1000
      if (remaining === step.sec) announce(step)
      setRunning(true)
    }
  }

  if (finished) return <Finish templateId={templateId} exercises={exercises} onExit={onExit} />

  const blockIdx = step.kind === 'work' || step.kind === 'rest' ? step.block : -1
  const ex = blockIdx >= 0 ? exercises[blockIdx] : null
  const nextBlock = step.kind === 'warmup' ? 0 : step.kind === 'rest' && step.round === tpl.blocks[step.block].rounds ? step.block + 1 : -1
  const pct = 1 - remaining / step.sec
  const mm = String(Math.floor(remaining / 60))
  const ss = String(remaining % 60).padStart(2, '0')
  const phase = step.kind === 'work' ? 'work' : step.kind === 'rest' ? 'rest' : 'easy'
  const totalLeft = steps.slice(idx + 1).reduce((a, x) => a + x.sec, 0) + remaining

  return (
    <div className={`player player--${phase}`}>
      <header className="player-head">
        <button className="icon-btn" onClick={onExit} aria-label={t('plQuit')}>
          <IconX />
        </button>
        <div className="player-title">
          <p>{tb(tpl.name).split(' · ')[0]}</p>
          <p className="muted small">
            {t('minLeft', { n: Math.ceil(totalLeft / 60) })}
          </p>
        </div>
        <span className="player-spacer" />
      </header>

      <div className="player-progress" aria-hidden="true">
        {tpl.blocks.map((_, i) => (
          <span key={i} className={i < blockIdx || step.kind === 'finisher' ? 'is-done' : i === blockIdx ? 'is-now' : ''} />
        ))}
      </div>

      <div className="player-stage">
        <p className="player-phase">
          {step.kind === 'warmup' ? t('plWarmup') : step.kind === 'finisher' ? t('plFinisher') : step.kind === 'work' ? t('plWork') : t('plRest')}
        </p>
        <div className="ring" role="timer" aria-live="off" aria-label={`${mm}:${ss}`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" className="ring-track" />
            <circle cx="60" cy="60" r="54" className="ring-fill" style={{ strokeDashoffset: 339.3 * (1 - pct) }} />
          </svg>
          <div className="ring-center">
            <span className="ring-time">
              {mm}:{ss}
            </span>
            {ex && step.kind !== 'warmup' && step.kind !== 'finisher' && (
              <span className="ring-sub">
                {t('plRound', { n: step.round, total: tpl.blocks[step.block].rounds })}
              </span>
            )}
          </div>
        </div>

        {ex ? (
          <div className="player-ex">
            <div className="player-ex-head">
              <div className="player-fig">
                <Figure pattern={ex.pattern} animate={running} />
              </div>
              <div>
                <p className="muted small">
                  {t('plBlock', { n: blockIdx + 1, total: tpl.blocks.length })} · {tb(PATTERN_CARD[ex.pattern].title)}
                </p>
                <h2 className="player-ex-name">{tb(ex.levels[level(ex)])}</h2>
                <p className="player-cue">{tb(ex.cues[(step.kind === 'work' ? step.round : 0) % ex.cues.length])}</p>
              </div>
            </div>
            <div className="levels" role="radiogroup">
              {ex.levels.map((lv, i) => (
                <button
                  key={i}
                  role="radio"
                  aria-checked={level(ex) === i}
                  className={`level ${level(ex) === i ? 'is-on' : ''}`}
                  onClick={() => update((d) => void (d.levels[ex.id] = i as 0 | 1 | 2))}
                >
                  <small>{t(LEVEL_KEYS[i])}</small>
                  <span>{tb(lv)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : step.kind === 'warmup' ? (
          <ul className="warmup-list">
            {WARMUP.map((w, i) => (
              <li key={i}>{tb(w)}</li>
            ))}
          </ul>
        ) : (
          <p className="player-finisher">{tb(tpl.finisher)}</p>
        )}

        {nextBlock >= 0 && nextBlock < exercises.length && (
          <p className="up-next">{t('plUpNext', { name: tb(exercises[nextBlock].levels[level(exercises[nextBlock])]) })}</p>
        )}
      </div>

      <footer className="player-controls">
        <button
          className="ctl"
          disabled={!ex}
          onClick={() => ex && update((d) => void (d.swaps[exerciseFor(ex.pattern, equip).id] = !d.swaps[exerciseFor(ex.pattern, equip).id]))}
        >
          <IconSwap />
          <span>{ex && s.swaps[exerciseFor(ex.pattern, equip).id] ? t('plSwapped') : t('plSwap')}</span>
        </button>
        <button className="ctl ctl-main" onClick={toggle} aria-label={running ? t('plPause') : t('plResume')}>
          {running ? <IconPause /> : <IconPlay />}
        </button>
        <button className="ctl" onClick={() => goto(idx + 1)}>
          <IconSkip />
          <span>{t('plNext')}</span>
        </button>
      </footer>
    </div>
  )
}

function Finish({ templateId, exercises, onExit }: { templateId: WorkoutTemplate['id']; exercises: Exercise[]; onExit: () => void }) {
  const { t, tb } = useT()
  const { s, update } = useStore()
  const [effort, setEffort] = useState<Effort | null>(null)
  const [win, setWin] = useState('')
  const [loads, setLoads] = useState<Record<string, string>>({})
  const weighted = exercises.filter((e) => e.equipment !== 'none')

  const saveIt = () => {
    const date = todayKey()
    update((d) => {
      d.logs.push({ id: uid(), templateId, date, effort: effort ?? 'right', win: win.trim() || undefined })
      d.checkIns[date] = { ...(d.checkIns[date] ?? {}), trained: true }
      for (const ex of exercises) {
        const level = d.levels[ex.id] ?? 1
        d.strength[ex.id] = { level, load: loads[ex.id]?.trim() || d.strength[ex.id]?.load, date }
      }
    })
    onExit()
  }

  return (
    <div className="finish">
      <div className="finish-burst" aria-hidden="true">
        <svg viewBox="0 0 200 120">
          <circle cx="100" cy="120" r="70" />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1="100" y1="40" x2="100" y2="14" transform={`rotate(${-80 + i * 20} 100 120)`} />
          ))}
        </svg>
      </div>
      <h1 className="display">{t('plDoneTitle')}</h1>
      <p className="muted">{t('plDoneBody')}</p>
      <div className="choices" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }} role="radiogroup">
        {(['easy', 'right', 'too_much'] as Effort[]).map((e) => (
          <button key={e} role="radio" aria-checked={effort === e} className={`choice ${effort === e ? 'is-on' : ''}`} onClick={() => setEffort(e)}>
            <span>{e === 'easy' ? t('effortEasy') : e === 'right' ? t('effortRight') : t('effortTooMuch')}</span>
          </button>
        ))}
      </div>
      {effort === 'too_much' && <p className="note">{t('effortNoteTooMuch')}</p>}

      <h2 className="h3">{t('plWinPrompt')}</h2>
      <div className="chips">
        {(['win1', 'win2', 'win3'] as const).map((k) => (
          <button key={k} className={`chip ${win === t(k) ? 'is-on' : ''}`} onClick={() => setWin(win === t(k) ? '' : t(k))}>
            {t(k)}
          </button>
        ))}
      </div>
      <input className="input" value={win} onChange={(e) => setWin(e.target.value)} maxLength={120} placeholder="…" />

      {weighted.length > 0 && (
        <>
          <h2 className="h3">{t('plLoad')}</h2>
          <div className="loads">
            {weighted.map((ex) => (
              <label key={ex.id} className="load-row">
                <span>{tb(ex.levels[s.levels[ex.id] ?? 1])}</span>
                <input className="input input-sm" value={loads[ex.id] ?? ''} placeholder={s.strength[ex.id]?.load ?? 'lb'} onChange={(e) => setLoads({ ...loads, [ex.id]: e.target.value })} />
              </label>
            ))}
          </div>
        </>
      )}

      <button className="btn btn-primary btn-start" onClick={saveIt}>
        {t('plSave')}
      </button>
    </div>
  )
}
