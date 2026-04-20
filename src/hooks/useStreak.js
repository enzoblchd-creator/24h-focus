import { useEffect, useRef, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useStreak(activeTasks) {
  const [completedDays, setCompletedDays] = useLocalStorage('24h-focus-completed-days', [])
  const savedRef = useRef(completedDays)

  useEffect(() => {
    if (activeTasks.length === 0 || !activeTasks.every(t => t.done)) return
    const today = new Date().toDateString()
    if (savedRef.current.includes(today)) return
    const next = [...savedRef.current, today].slice(-60)
    savedRef.current = next
    setCompletedDays(next)
  }, [activeTasks, setCompletedDays])

  return useMemo(() => {
    let count = 0
    const d = new Date()
    while (completedDays.includes(d.toDateString())) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  }, [completedDays])
}
