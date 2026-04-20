import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import confetti from 'canvas-confetti'
import { Moon, Sun, Flame } from 'lucide-react'

import { useLocalStorage } from './hooks/useLocalStorage'
import { useSound } from './hooks/useSound'
import { useStreak } from './hooks/useStreak'
import ProgressBar from './components/ProgressBar'
import TaskInput from './components/TaskInput'
import TaskCard from './components/TaskCard'
import Graveyard from './components/Graveyard'

const H24 = 24 * 60 * 60 * 1000
const H48 = 48 * 60 * 60 * 1000

function classifyTasks(tasks) {
  const now = Date.now()
  const active = []
  const expired = []
  for (const t of tasks) {
    const age = now - t.createdAt
    if (t.done && age >= H24) continue       // done tasks vanish after 24h
    if (age >= H48) continue                 // unchecked tasks vanish after 48h
    if (!t.done && age >= H24) expired.push(t)  // graveyard: unchecked 24–48h
    else active.push(t)
  }
  return { active, expired }
}

function fireConfetti(isDark) {
  confetti({
    particleCount: 90,
    spread: 65,
    origin: { y: 0.55 },
    colors: isDark
      ? ['#ffffff', '#e2e8f0', '#94a3b8', '#f1f5f9']
      : ['#000000', '#1e293b', '#334155', '#475569'],
    shapes: ['square'],
    scalar: 0.75,
    gravity: 1.2,
    drift: 0,
  })
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('24h-focus-tasks', [])
  const [isDark, setIsDark] = useLocalStorage('24h-focus-dark', false)
  const [filterTag, setFilterTag] = useState(null)
  const { playTick } = useSound()

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Purge >48h tasks every minute
  useEffect(() => {
    const purge = () => setTasks(prev => prev.filter(t => {
      const age = Date.now() - t.createdAt
      return t.done ? age < H24 : age < H48
    }))
    purge()
    const id = setInterval(purge, 60_000)
    return () => clearInterval(id)
  }, [setTasks])

  const { active: rawActive, expired } = useMemo(() => classifyTasks(tasks), [tasks])
  const active = useMemo(() => filterTag
    ? [...rawActive].sort((a, b) => (a.tag === filterTag ? 0 : 1) - (b.tag === filterTag ? 0 : 1))
    : rawActive
  , [rawActive, filterTag])

  // Streak
  const streak = useStreak(active)

  // Confetti when all tasks become done
  const prevAllDoneRef = useRef(false)
  useEffect(() => {
    const allDone = active.length > 0 && active.every(t => t.done)
    if (allDone && !prevAllDoneRef.current) fireConfetti(isDark)
    prevAllDoneRef.current = allDone
  }, [active, isDark])

  // Drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleDragEnd = useCallback(({ active: dragActive, over }) => {
    if (!over || dragActive.id === over.id) return
    setTasks(prev => {
      const oldIdx = prev.findIndex(t => t.id === dragActive.id)
      const newIdx = prev.findIndex(t => t.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }, [setTasks])

  // Task actions
  const addTask = useCallback((text, tag) => {
    setTasks(prev => [
      { id: crypto.randomUUID(), text, tag: tag ?? null, createdAt: Date.now(), done: false, priority: false },
      ...prev,
    ])
  }, [setTasks])

  const toggleDone = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }, [setTasks])

  const togglePriority = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority: !t.priority } : t))
  }, [setTasks])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [setTasks])

  const reviveTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, createdAt: Date.now(), done: false } : t))
  }, [setTasks])

  const done = active.filter(t => t.done).length
  const total = active.length

  return (
    <>
      <ProgressBar tasks={[...active, ...expired.map(t => ({ ...t, expired: true }))]} />

      <main className="min-h-screen bg-surface dark:bg-[#0F0F11] px-6 py-20 transition-colors duration-300">
        <div className="mx-auto max-w-[480px]">

          {/* Header */}
          <motion.header
            className="mb-10 flex items-start justify-between"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-black dark:text-white leading-none">
                24h focus.
              </h1>
              <p className="text-[13px] text-[#94A3B8] font-light mt-1">
                {total === 0
                  ? 'Add something to focus on today.'
                  : `${done} of ${total} done today`}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {/* Streak badge */}
              {streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-[12px] font-medium text-[#94A3B8] dark:text-white/40 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-full"
                  title={`${streak}-day streak`}
                >
                  <Flame size={11} strokeWidth={2} />
                  {streak}
                </motion.div>
              )}

              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDark(d => !d)}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 focus:outline-none"
              >
                {isDark ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
              </button>
            </div>
          </motion.header>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <TaskInput onAdd={addTask} filterTag={filterTag} onFilterTag={setFilterTag} />
          </motion.div>

          {/* Active task list */}
          {active.length > 0 && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={active.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2" role="list" aria-label="Today's tasks">
                    <AnimatePresence mode="popLayout">
                      {active.map(task => (
                        <li key={task.id}>
                          <TaskCard
                            task={task}
                            onToggle={toggleDone}
                            onPriority={togglePriority}
                            onDelete={deleteTask}
                            onPlay={playTick}
                          />
                        </li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </SortableContext>
              </DndContext>
            </motion.div>
          )}

          {/* Empty state */}
          <AnimatePresence>
            {active.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="mt-12 text-center"
              >
                <p className="text-4xl mb-3 text-black dark:text-white">✦</p>
                <p className="text-[14px] text-[#94A3B8] font-light">Your slate is clean.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Graveyard */}
          <Graveyard tasks={expired} onRevive={reviveTask} />

        </div>
      </main>

      {/* Debug: simulate +24h */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setTasks(prev => prev.map(t => ({ ...t, createdAt: t.createdAt - H24 })))}
          title="Simulate +24h"
          className="text-[11px] font-light text-gray-300 dark:text-white/10 bg-white dark:bg-transparent hover:text-gray-400 dark:hover:text-white/20 transition-colors duration-150 px-3 py-1.5 rounded-full focus:outline-none"
        >
          +24h
        </button>
      </div>
    </>
  )
}
