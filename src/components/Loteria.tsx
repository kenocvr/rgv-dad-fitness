import type { ReactNode } from 'react'

// The one loud element in the app: sessions and moves are drawn as Lotería cards —
// card number, picture, title banner — the way every Valley kitchen table knows them.
export function LoteriaCard({
  num,
  title,
  art,
  tone = 'mango',
  size = 'md',
  children,
}: {
  num: number | string
  title: string
  art: ReactNode
  tone?: 'mango' | 'chile' | 'nopal' | 'cielo'
  size?: 'sm' | 'md' | 'lg'
  children?: ReactNode
}) {
  return (
    <div className={`loteria loteria--${tone} loteria--${size}`}>
      <div className="loteria-frame">
        <span className="loteria-num">{num}</span>
        <div className="loteria-art">{art}</div>
        <div className="loteria-title">{title}</div>
      </div>
      {children}
    </div>
  )
}
