import { motion } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'

function timeLeft(createdAt) {
  const diff = 24 * 60 * 60 * 1000 - (Date.now() - createdAt)
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h === 0) return `${m}m left`
  return `${h}h left`
}

function urgencyColor(createdAt) {
  const elapsed = Date.now() - createdAt
  const pct = elapsed / (24 * 60 * 60 * 1000)
  if (pct > 0.85) return 'text-red-400 bg-red-50'
  if (pct > 0.6) return 'text-amber-500 bg-amber-50'
  return 'text-[#94A3B8] bg-black/4'
}

export default function TaskCard({ task, onToggle, onPriority, onDelete }) {
  const remaining = timeLeft(task.createdAt)
  const badgeClass = urgencyColor(task.createdAt)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group flex items-center gap-4 bg-white rounded-3xl px-5 py-4 shadow-card hover:shadow-card-hover transition-shadow duration-200"
    >
      {/* Circular checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
        aria-pressed={task.done}
        className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-black/20 rounded-full"
      >
        <motion.div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center
            transition-colors duration-200
            ${task.done ? 'border-black bg-black' : 'border-black/20 bg-transparent hover:border-black/50'}
          `}
          animate={task.done ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {task.done && (
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
              width="10" height="8" viewBox="0 0 10 8" fill="none"
            >
              <motion.path
                d="M1 4L3.5 6.5L9 1"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.svg>
          )}
        </motion.div>
      </button>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <motion.p
          className={`text-[15px] font-medium leading-snug truncate transition-colors duration-200 ${task.done ? 'text-[#94A3B8] line-through decoration-[#94A3B8]' : 'text-black'}`}
        >
          {task.priority && !task.done && (
            <span className="inline-flex items-center mr-1.5 text-black" aria-label="Priority">
              <AlertCircle size={13} strokeWidth={2.5} className="inline -mt-0.5" />
            </span>
          )}
          {task.text}
        </motion.p>
        {remaining && !task.done && (
          <p className={`text-[11px] font-light mt-0.5 px-2 py-0.5 rounded-full inline-block ${badgeClass}`}>
            {remaining}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onPriority(task.id)}
          aria-label={task.priority ? 'Remove priority' : 'Mark as priority'}
          aria-pressed={task.priority}
          className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-black/20
            ${task.priority ? 'bg-black text-white' : 'bg-black/5 text-black/40 hover:bg-black/10'}
          `}
        >
          !
        </button>
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 text-black/30 hover:bg-red-50 hover:text-red-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  )
}
