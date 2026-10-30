import { createContext, useContext } from 'react'
import { STRINGS, type StringKey } from './strings'

export type Lang = 'en' | 'es'
/** A bilingual value. Content entities carry both languages, written natively. */
export interface Bi {
  en: string
  es: string
}

export const LangContext = createContext<Lang>('en')

export function useT() {
  const lang = useContext(LangContext)
  const t = (key: StringKey, vars?: Record<string, string | number>) => {
    let s = STRINGS[key][lang]
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
    return s
  }
  const tb = (b: Bi) => b[lang]
  return { t, tb, lang }
}
