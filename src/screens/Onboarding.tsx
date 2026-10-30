import { useState } from 'react'
import { LangContext, useT, type Lang } from '../i18n'
import { useStore, type EquipChoice, type Goal, type Location, type User } from '../store'
import { Choice, Toggle } from '../components/ui'
import { SaturdayArt } from '../components/Figure'
import { LoteriaCard } from '../components/Loteria'
import { todayKey, weekdayName } from '../dates'

const CITIES = ['McAllen', 'Edinburg', 'Pharr', 'Mission', 'Weslaco', 'Brownsville', 'Harlingen']
const PARQ = ['par1', 'par2', 'par3', 'par4', 'par5'] as const

// Onboarding target: install → first scheduled session in under 2 minutes, zero typing required.
export function Onboarding({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [step, setStep] = useState(0)
  if (step === 0)
    return (
      <div className="ob ob-lang">
        <div className="ob-lang-art">
          <LoteriaCard num={1} title="El Sábado" art={<SaturdayArt />} size="lg" />
        </div>
        <h1 className="ob-hello">
          <span lang="en">Hey, dad.</span>
          <span lang="es">Qué onda, papá.</span>
        </h1>
        <div className="ob-lang-buttons">
          <button className="btn btn-primary btn-lg" onClick={() => (setLang('en'), setStep(1))}>
            English
          </button>
          <button className="btn btn-primary btn-lg" lang="es" onClick={() => (setLang('es'), setStep(1))}>
            Español
          </button>
        </div>
      </div>
    )
  return (
    <LangContext.Provider value={lang}>
      <Steps lang={lang} step={step} setStep={setStep} />
    </LangContext.Provider>
  )
}

function Steps({ lang, step, setStep }: { lang: Lang; step: number; setStep: (n: number) => void }) {
  const { t } = useT()
  const { update } = useStore()
  const [name, setName] = useState('')
  const [city, setCity] = useState('McAllen')
  const [location, setLocation] = useState<Location>('home')
  const [equipment, setEquipment] = useState<EquipChoice>('none')
  const [days, setDays] = useState<number[]>([1, 3, 5])
  const [sat, setSat] = useState(true)
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null, null, null])
  const [cleared, setCleared] = useState(false)
  const [goal, setGoal] = useState<Goal>('train3')

  const total = 5
  const anyYes = answers.some((a) => a === true)
  const allAnswered = answers.every((a) => a !== null)

  const finish = () => {
    const user: User = {
      firstName: name.trim(),
      lang,
      city,
      location,
      equipment,
      days,
      saturdayInvites: sat,
      readiness: anyYes ? (cleared ? 'cleared_by_doctor' : 'see_doctor') : 'clear',
      goal,
      createdAt: todayKey(),
    }
    update((s) => {
      s.user = user
    })
  }

  const canNext = step === 3 ? days.length === 3 : step === 4 ? allAnswered : true

  return (
    <div className="ob">
      {step >= 2 && (
        <div className="ob-progress" aria-label={t('obStep', { n: step - 1, total })}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < step - 1 ? 'is-on' : ''} />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="ob-body ob-welcome">
          <h1 className="display">{t('obWelcomeTitle')}</h1>
          <blockquote className="founder">
            <p>{t('founderStory')}</p>
            <cite>{t('founderSign')}</cite>
          </blockquote>
          <p className="ob-free">{t('obFree')}</p>
        </div>
      )}

      {step === 2 && (
        <div className="ob-body">
          <h1 className="h1">{t('obNameTitle')}</h1>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('obNamePlaceholder')} autoComplete="given-name" maxLength={24} />
          <h2 className="h2">{t('obCity')}</h2>
          <Choice
            columns={2}
            value={city}
            onChange={setCity}
            options={[...CITIES.map((c) => ({ value: c, label: c })), { value: 'RGV', label: t('obOtherCity') }]}
          />
        </div>
      )}

      {step === 3 && (
        <div className="ob-body">
          <h1 className="h1">{t('obWhereTitle')}</h1>
          <Choice columns={3} value={location} onChange={setLocation} options={[{ value: 'home', label: t('locHome') }, { value: 'gym', label: t('locGym') }, { value: 'both', label: t('locBoth') }]} />
          <h2 className="h2">{t('obEquipTitle')}</h2>
          <Choice
            columns={2}
            value={equipment}
            onChange={setEquipment}
            options={[
              { value: 'none', label: t('eqNone') },
              { value: 'dumbbells', label: t('eqDumbbells') },
              { value: 'kettlebells', label: t('eqKettlebells') },
              { value: 'gym', label: t('eqGym') },
            ]}
          />
          <h2 className="h2">{t('obDaysTitle')}</h2>
          <p className="muted">{t('obDaysHint')}</p>
          <Choice
            multi
            columns={6}
            value={days}
            onChange={(d) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : cur.length < 3 ? [...cur, d] : cur))}
            options={[1, 2, 3, 4, 5, 0].map((d) => ({ value: d, label: weekdayName(d, lang) }))}
          />
          <p className="muted small">{t('obDaysCount', { n: days.length })}</p>
          <Toggle on={sat} onChange={setSat} label={t('obSaturdayToggle')} />
        </div>
      )}

      {step === 4 && (
        <div className="ob-body">
          <h1 className="h1">{t('obReadyTitle')}</h1>
          <p className="muted">{t('obReadyHint')}</p>
          <ol className="parq">
            {PARQ.map((k, i) => (
              <li key={k}>
                <p>{t(k)}</p>
                <div className="yn">
                  {[false, true].map((v) => (
                    <button key={String(v)} className={`chip ${answers[i] === v ? 'is-on' : ''}`} aria-pressed={answers[i] === v} onClick={() => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))}>
                      {v ? t('yes') : t('no')}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          {anyYes && (
            <div className="callout callout-warn">
              <h3>{t('obDoctorTitle')}</h3>
              <p>{t('obDoctorBody')}</p>
              <Toggle on={cleared} onChange={setCleared} label={t('obCleared')} />
            </div>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="ob-body">
          <h1 className="h1">{t('obGoalTitle')}</h1>
          <Choice
            columns={1}
            value={goal}
            onChange={setGoal}
            options={[
              { value: 'train3', label: t('goalTrain3') },
              { value: 'lose', label: t('goalLose') },
              { value: 'stronger', label: t('goalStronger') },
              { value: 'keepup', label: t('goalKeepup') },
            ]}
          />
          <p className="fine">{t('obDisclaimer')}</p>
        </div>
      )}

      <div className="ob-actions">
        {step > 1 && (
          <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
            {t('obBack')}
          </button>
        )}
        {step < 5 ? (
          <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            {step === 1 ? t('obLetsGo') : t('obNext')}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={finish}>
            {t('obFinish')}
          </button>
        )}
      </div>
    </div>
  )
}
