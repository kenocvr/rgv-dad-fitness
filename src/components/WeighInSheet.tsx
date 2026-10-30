import { useState } from 'react'
import { useT } from '../i18n'
import { useStore } from '../store'
import { todayKey } from '../dates'
import { Sheet } from './ui'

export function WeighInSheet({ onClose }: { onClose: () => void }) {
  const { t } = useT()
  const { s, update } = useStore()
  const today = todayKey()
  const last = [...s.weighIns].sort((a, b) => a.date.localeCompare(b.date)).at(-1)
  const [lbs, setLbs] = useState<number>(last?.lbs ?? 200)
  const [bf, setBf] = useState<string>('')
  const step = (d: number) => setLbs((v) => Math.round((v + d) * 10) / 10)

  const saveIt = () => {
    update((d) => {
      d.weighIns = d.weighIns.filter((w) => w.date !== today)
      const bodyFat = parseFloat(bf)
      d.weighIns.push({ date: today, lbs, bodyFat: Number.isFinite(bodyFat) ? bodyFat : undefined })
    })
    onClose()
  }

  return (
    <Sheet title={t('progAddWeigh')} onClose={onClose}>
      <p className="protocol">{t('progProtocol')}</p>
      <div className="stepper">
        <button className="stepper-btn" onClick={() => step(-1)} aria-label="-1">−1</button>
        <button className="stepper-btn" onClick={() => step(-0.2)} aria-label="-0.2">−.2</button>
        <label className="stepper-value">
          <input type="number" inputMode="decimal" step="0.1" value={lbs} onChange={(e) => setLbs(parseFloat(e.target.value) || 0)} aria-label={t('lb')} />
          <span>{t('lb')}</span>
        </label>
        <button className="stepper-btn" onClick={() => step(0.2)} aria-label="+0.2">+.2</button>
        <button className="stepper-btn" onClick={() => step(1)} aria-label="+1">+1</button>
      </div>
      <label className="field">
        <span>{t('progBodyFat')}</span>
        <input className="input" type="number" inputMode="decimal" step="0.1" value={bf} onChange={(e) => setBf(e.target.value)} />
        <small>{t('progBodyFatNote')}</small>
      </label>
      <div className="sheet-actions">
        <button className="btn btn-ghost" onClick={onClose}>
          {t('cancel')}
        </button>
        <button className="btn btn-primary" onClick={saveIt}>
          {t('save')}
        </button>
      </div>
    </Sheet>
  )
}
