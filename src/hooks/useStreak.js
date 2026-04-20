import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useStreak(activeTasks) {
  const [completedDays, setCompletedDays] = useLocalStorage('24h-focus-completed-days', [])

  useEffect(() => {
    if (activeTasks.length === 0) return
    if (!activeTasks.every(t => t.done)) return
    const today = new Date().toDateString()
    if (completedDays.includes(today)) return
    setCompletedDays(prev => [...prev, today].slice(-60))
  }, [activeTasks, completedDays, setCompletedDays])

  const streak = (() => {
    let count = 0
    const d = new Date()
    while (true) {
      if (completedDays.includes(d.toDateString())) {
        count++
        d.setDate(d.getDate() - 1)
      } else break
    }
    return count
  })()

  return streak
}
