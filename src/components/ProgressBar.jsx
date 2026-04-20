import { motion } from 'framer-motion'

export default function ProgressBar({ tasks }) {
  const active = tasks.filter(t => !t.expired)
  const done = active.filter(t => t.done).length
  const total = active.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] bg-black/5 z-50"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${done} of ${total} tasks completed`}
    >
      <motion.div
        className="h-full bg-black origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: pct / 100 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  )
}
