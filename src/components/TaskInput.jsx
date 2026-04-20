import { useState } from 'react'
import { Plus } from 'lucide-react'

const TAGS = ['work', 'perso', 'urgent']

const TAG_STYLES = {
  work:   { active: 'bg-black text-white dark:bg-white dark:text-black', idle: 'text-[#94A3B8] hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white' },
  perso:  { active: 'bg-black text-white dark:bg-white dark:text-black', idle: 'text-[#94A3B8] hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white' },
  urgent: { active: 'bg-black text-white dark:bg-white dark:text-black', idle: 'text-[#94A3B8] hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white' },
}

export default function TaskInput({ onAdd, filterTag, onFilterTag }) {
  const [value, setValue] = useState('')

  const submit = () => {
    const text = value.trim()
    if (!text) return
    onAdd(text, filterTag)
    setValue('')
  }

  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="What is your focus for today?"
          aria-label="Add a new task"
          className="
            w-full rounded-full border border-black/[0.08] dark:border-white/10
            bg-white dark:bg-[#1A1A1F]
            px-6 py-4 pr-14
            text-[15px] font-medium text-black dark:text-white
            placeholder:text-[#94A3B8] placeholder:font-normal
            shadow-card focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
            transition-shadow duration-200 hover:shadow-card-hover
          "
        />
        <button
          onClick={submit}
          aria-label="Add task"
          className="
            absolute right-2 flex items-center justify-center
            w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black
            hover:bg-black/80 dark:hover:bg-white/80 active:scale-95
            transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-black/30
          "
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Tag selector */}
      <div className="flex gap-2 pl-1" role="group" aria-label="Task category">
        {TAGS.map(t => (
          <button
            key={t}
            onClick={() => onFilterTag(filterTag === t ? null : t)}
            aria-pressed={filterTag === t}
            className={`
              text-[11px] font-medium px-3 py-1 rounded-full border
              transition-all duration-150 focus:outline-none
              ${filterTag === t
                ? `${TAG_STYLES[t].active} border-transparent`
                : `border-black/[0.08] dark:border-white/10 ${TAG_STYLES[t].idle}`
              }
            `}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
