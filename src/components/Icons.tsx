const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export const IconToday = () => (
  <svg {...base}>
    <circle cx="12" cy="13" r="4" />
    <path d="M12 3v3M4.9 6.9l2 2M19.1 6.9l-2 2M2 17h20M6 21h12" />
  </svg>
)
export const IconTrain = () => (
  <svg {...base}>
    <path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" />
  </svg>
)
export const IconSaturday = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4M12 14v3" />
  </svg>
)
export const IconProgress = () => (
  <svg {...base}>
    <path d="M3 17l5-5 4 3 8-8" />
    <path d="M14 7h6v6" />
  </svg>
)
export const IconCrew = () => (
  <svg {...base}>
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 .2 6 2 6 5.5" />
  </svg>
)
export const IconCheck = () => (
  <svg {...base}>
    <path d="M5 12l5 5 9-10" />
  </svg>
)
export const IconPin = () => (
  <svg {...base}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)
export const IconPlay = () => (
  <svg {...base} fill="currentColor" stroke="none">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
)
export const IconPause = () => (
  <svg {...base}>
    <path d="M9 5v14M15 5v14" />
  </svg>
)
export const IconSkip = () => (
  <svg {...base}>
    <path d="M6 5l9 7-9 7zM18 5v14" />
  </svg>
)
export const IconSwap = () => (
  <svg {...base}>
    <path d="M4 8h14l-3-3M20 16H6l3 3" />
  </svg>
)
export const IconX = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
export const IconShare = () => (
  <svg {...base}>
    <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
  </svg>
)
export const IconSun = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
export const IconChevron = () => (
  <svg {...base}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)
