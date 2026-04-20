import { useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocalStorage } from './hooks/useLocalStorage'
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
    if (age >= H48) continue          // silently drop >48h
    if (age >= H24) expired.push(t)   // graveyard 24-48h
    else active.push(t)               // main list <24h
  }

  // priority tasks first, then by createdAt desc
  active.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority
    return b.createdAt - a.createdAt
  })

  return { active, expired }
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('24h-focus-tasks', [])

  // Purge >48h tasks and re-save every minute
  useEffect(() => {
    const purge = () =>
      setTasks(prev => prev.filter(t => Date.now() - t.createdAt < H48))

    purge()
    const id = setInterval(purge, 60 * 1000)
    return () => clearInterval(id)
  }, [setTasks])

  const addTask = useCallback((text) => {
    setTasks(prev => [
      ...prev,
      { id: crypto.randomUUID(), text, createdAt: Date.now(), done: false, priority: false },
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

  const { active, expired } = classifyTasks(tasks)

  return (
    <>
      <ProgressBar tasks={[...active, ...expired.map(t => ({ ...t, expired: true }))]} />

      <main className="min-h-screen bg-surface px-6 py-20">
        <div className="mx-auto max-w-[480px]">

          {/* Header */}
          <motion.header
            className="mb-10"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[22px] font-bold tracking-tight text-black leading-none">
              24h focus.
            </h1>
            <p className="text-[13px] text-[#94A3B8] font-light mt-1">
              {active.length === 0
                ? 'Add something to focus on today.'
                : `${active.filter(t => t.done).length} of ${active.length} done today`}
            </p>
          </motion.header>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <TaskInput onAdd={addTask} />
          </motion.div>

          {/* Active task list */}
          {active.length > 0 && (
            <motion.ul
              className="mt-4 space-y-2"
              role="list"
              aria-label="Today's tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <AnimatePresence mode="popLayout">
                {active.map(task => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      onToggle={toggleDone}
                      onPriority={togglePriority}
                      onDelete={deleteTask}
                    />
                  </li>
                ))}
              </AnimatePresence>
            </motion.ul>
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
                <p className="text-4xl mb-3" aria-hidden="true">✦</p>
                <p className="text-[14px] text-[#94A3B8] font-light">
                  Your slate is clean.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Graveyard */}
          <Graveyard tasks={expired} onRevive={reviveTask} />

        </div>
      </main>
    </>
  )
}
