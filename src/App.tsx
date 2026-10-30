import { useEffect, useMemo, useState } from 'react'
import { LangContext, type Lang } from './i18n'
import { StoreContext, load, save, type State, type Store } from './store'
import { demoState } from './demo'
import type { WorkoutTemplate } from './data/program'
import { Onboarding } from './screens/Onboarding'
import { Today } from './screens/Today'
import { Train } from './screens/Train'
import { Saturday } from './screens/Saturday'
import { Progress } from './screens/Progress'
import { Crew } from './screens/Crew'
import { Player } from './screens/Player'
import { TabBar, type Tab } from './components/TabBar'
import { useT } from './i18n'

function initialState(): { state: State; tab: Tab } {
  const q = new URLSearchParams(location.search)
  let state = load()
  if (q.has('demo')) state = demoState()
  const lang = q.get('lang')
  if (state.user && (lang === 'en' || lang === 'es')) state.user.lang = lang
  if (q.has('sun')) state.sunMode = true
  const tab = (q.get('tab') as Tab) || 'today'
  return { state, tab }
}

export default function App() {
  const init = useMemo(initialState, [])
  const [s, setS] = useState<State>(init.state)
  const [tab, setTab] = useState<Tab>(init.tab)
  const [playing, setPlaying] = useState<WorkoutTemplate['id'] | null>(() => {
    const p = new URLSearchParams(location.search).get('play')
    return (p as WorkoutTemplate['id']) || null
  })
  const [obLang, setObLang] = useState<Lang>('en')

  useEffect(() => save(s), [s])

  const store: Store = useMemo(
    () => ({
      s,
      update: (fn) =>
        setS((prev) => {
          const next = structuredClone(prev)
          fn(next)
          return next
        }),
      replace: setS,
    }),
    [s],
  )

  const lang = s.user?.lang ?? obLang

  useEffect(() => {
    document.documentElement.lang = lang === 'es' ? 'es-MX' : 'en'
    document.documentElement.dataset.sun = s.sunMode ? 'on' : 'off'
  }, [lang, s.sunMode])

  return (
    <StoreContext.Provider value={store}>
      <LangContext.Provider value={lang}>
        <div className="stage">
          <Showcase />
          <div className="device">
            {!s.user ? (
              <Onboarding lang={obLang} setLang={setObLang} />
            ) : playing ? (
              <Player templateId={playing} onExit={() => setPlaying(null)} />
            ) : (
              <>
                <main className="screen" key={tab}>
                  {tab === 'today' && <Today onStart={setPlaying} goTo={setTab} />}
                  {tab === 'train' && <Train onStart={setPlaying} />}
                  {tab === 'saturday' && <Saturday />}
                  {tab === 'progress' && <Progress />}
                  {tab === 'crew' && <Crew />}
                </main>
                <TabBar tab={tab} setTab={setTab} />
              </>
            )}
          </div>
        </div>
      </LangContext.Provider>
    </StoreContext.Provider>
  )
}

/** Desktop-only side panel: the founder story beside the phone. Hidden on phones. */
function Showcase() {
  const { t } = useT()
  return (
    <aside className="showcase" aria-hidden="true">
      <p className="showcase-name">{t('appName')}</p>
      <h1 className="showcase-title">{t('obWelcomeTitle')}</h1>
      <p className="showcase-body">{t('founderStory')}</p>
      <p className="showcase-meta">{t('obFree')}</p>
    </aside>
  )
}
