import { useEffect } from 'react'
import { WizardShell } from './components/wizard/WizardShell'

function App() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = (dark: boolean) => {
      document.documentElement.classList.toggle('dark', dark)
    }
    applyTheme(mq.matches)
    const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans">
      <WizardShell />
    </div>
  )
}

export default App
