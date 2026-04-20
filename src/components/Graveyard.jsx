import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, RotateCcw } from 'lucide-react'

function hoursAgo(createdAt) {
  const h = Math.floor((Date.now() - createdAt) / 3600000)
  return h === 1 ? '1 hour ago' : `${h} hours ago`
}

export default function Graveyard({ tasks, onRevive }) {
  const [open, setOpen] = useState(false)

  if (tasks.length === 0) return null

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 text-[#94A3B8] text-sm font-medium w-full focus:outline-none group"
      >
        <span className="flex-1 text-left">Yesterday</span>
        <span className="text-xs bg-black/5 text-black/30 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} strokeWidth={2} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden mt-3 space-y-2"
            role="list"
            aria-label="Expired tasks from yesterday"
          >
            {tasks.map(task => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group flex items-center gap-4 bg-white/60 rounded-3xl px-5 py-4 border border-black/4"
              >
                <div className="w-6 h-6 rounded-full border-2 border-black/10 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-black/30 line-through decoration-black/15 truncate">
                    {task.text}
                  </p>
                  <p className="text-[11px] font-light text-black/20 mt-0.5">
                    {hoursAgo(task.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => onRevive(task.id)}
                  aria-label={`Revive "${task.text}"`}
                  className="
                    flex-shrink-0 flex items-center gap-1.5
                    text-[11px] font-medium text-[#94A3B8]
                    opacity-0 group-hover:opacity-100 focus:opacity-100
                    hover:text-black transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-black/15 rounded-full px-2 py-1
                  "
                >
                  <RotateCcw size={11} strokeWidth={2.5} />
                  Revive
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
