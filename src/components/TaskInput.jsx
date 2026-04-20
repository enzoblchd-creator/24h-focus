import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function TaskInput({ onAdd }) {
  const [value, setValue] = useState('')

  const submit = () => {
    const text = value.trim()
    if (!text) return
    onAdd(text)
    setValue('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="What is your focus for today?"
        aria-label="Add a new task"
        className="
          w-full rounded-full border border-black/8 bg-white
          px-6 py-4 pr-14
          text-[15px] font-medium text-black placeholder:text-[#94A3B8] placeholder:font-normal
          shadow-card focus:outline-none focus:ring-2 focus:ring-black/10
          transition-shadow duration-200 hover:shadow-card-hover
        "
      />
      <button
        onClick={submit}
        aria-label="Add task"
        className="
          absolute right-2 flex items-center justify-center
          w-9 h-9 rounded-full bg-black text-white
          hover:bg-black/80 active:scale-95
          transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-black/30
        "
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
