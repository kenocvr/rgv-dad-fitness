import { useEffect, type ReactNode } from 'react'
import { useT } from '../i18n'
import { IconX } from './Icons'

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useT()
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t('close')}>
            <IconX />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Choice<T extends string | number>({
  options,
  value,
  onChange,
  multi,
  columns = 2,
}: {
  options: { value: T; label: string; sub?: string }[]
  value: T | T[]
  onChange: (v: T) => void
  multi?: boolean
  columns?: number
}) {
  const isOn = (v: T) => (multi ? (value as T[]).includes(v) : value === v)
  return (
    <div className="choices" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} role={multi ? 'group' : 'radiogroup'}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          className={`choice ${isOn(o.value) ? 'is-on' : ''}`}
          role={multi ? 'checkbox' : 'radio'}
          aria-checked={isOn(o.value)}
          onClick={() => onChange(o.value)}
        >
          <span>{o.label}</span>
          {o.sub && <small>{o.sub}</small>}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button className="toggle-row" role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="toggle-text">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </span>
      <span className={`toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
        <span />
      </span>
    </button>
  )
}

export function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
