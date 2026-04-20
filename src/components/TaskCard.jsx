import { motion } from 'framer-motion'
import { X, AlertCircle, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function timeLeft(createdAt) {
  const diff = 24 * 60 * 60 * 1000 - (Date.now() - createdAt)
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h === 0 ? `${m}m left` : `${h}h left`
}

function urgencyClass(createdAt) {
  const pct = (Date.now() - createdAt) / (24 * 60 * 60 * 1000)
  if (pct > 0.85) return 'text-red-400 bg-red-50 dark:bg-red-950/40'
  if (pct > 0.60) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
  return 'text-[#94A3B8] bg-black/[0.04] dark:bg-white/[0.06]'
}

const TAG_BADGE = {
  work:   'text-blue-400/80 bg-blue-50 dark:bg-blue-950/40',
  perso:  'text-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/40',
  urgent: 'text-rose-400/80 bg-rose-50 dark:bg-rose-950/40',
}

export default function TaskCard({ task, onToggle, onPriority, onDelete, onPlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  }

  const remaining = timeLeft(task.createdAt)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group flex items-center gap-3 bg-white dark:bg-[#1A1A1F] rounded-3xl px-4 py-4 shadow-card hover:shadow-card-hover transition-shadow duration-200"
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        aria-label="Drag to reorder"
        className="flex-shrink-0 text-black/10 dark:text-white/10 hover:text-black/30 dark:hover:text-white/30 cursor-grab active:cursor-grabbing transition-colors duration-150 focus:outline-none touch-none"
      >
        <GripVertical size={14} strokeWidth={2} />
      </button>

      {/* Circular checkbox */}
      <button
        onClick={() => { onToggle(task.id); if (!task.done) onPlay() }}
        aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
        aria-pressed={task.done}
        className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 rounded-full"
      >
        <motion.div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center
            transition-colors duration-200
            ${task.done
              ? 'border-black bg-black dark:border-white dark:bg-white'
              : 'border-black/20 dark:border-white/20 hover:border-black/50 dark:hover:border-white/50'
            }
          `}
          animate={task.done ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {task.done && (
            <motion.svg
              width="10" height="8" viewBox="0 0 10 8" fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.path
                d="M1 4L3.5 6.5L9 1"
                stroke={task.done ? 'white' : 'black'}
                className="dark:[stroke:#000]"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
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
        <p className={`text-[15px] font-medium leading-snug truncate transition-colors duration-200 ${task.done ? 'text-[#94A3B8] line-through decoration-[#94A3B8]' : 'text-black dark:text-white'}`}>
          {task.priority && !task.done && (
            <span className="inline-flex items-center mr-1.5 text-black dark:text-white" aria-label="Priority">
              <AlertCircle size={13} strokeWidth={2.5} className="inline -mt-0.5" />
            </span>
          )}
          {task.text}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {remaining && !task.done && (
            <span className={`text-[11px] font-light px-2 py-0.5 rounded-full inline-block ${urgencyClass(task.createdAt)}`}>
              {remaining}
            </span>
          )}
          {task.tag && (
            <span className={`text-[11px] font-light px-2 py-0.5 rounded-full inline-block ${TAG_BADGE[task.tag] ?? 'text-[#94A3B8] bg-black/5'}`}>
              {task.tag}
            </span>
          )}
        </div>
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
            ${task.priority
              ? 'bg-black dark:bg-white text-white dark:text-black'
              : 'bg-black/5 dark:bg-white/10 text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/20'
            }
          `}
        >
          !
        </button>
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-black/30 dark:text-white/30 hover:bg-red-50 hover:text-red-400 transition-colors duration-150 focus:outline-none"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  )
}
