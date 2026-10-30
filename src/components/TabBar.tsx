import { useT } from '../i18n'
import { IconCrew, IconProgress, IconSaturday, IconToday, IconTrain } from './Icons'

export type Tab = 'today' | 'train' | 'saturday' | 'progress' | 'crew'

export function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { t } = useT()
  const items: [Tab, string, JSX.Element][] = [
    ['today', t('tabToday'), <IconToday />],
    ['train', t('tabTrain'), <IconTrain />],
    ['saturday', t('tabSaturday'), <IconSaturday />],
    ['progress', t('tabProgress'), <IconProgress />],
    ['crew', t('tabCrew'), <IconCrew />],
  ]
  return (
    <nav className="tabbar" aria-label="Main">
      {items.map(([id, label, icon]) => (
        <button key={id} className={`tab ${tab === id ? 'is-active' : ''}`} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
