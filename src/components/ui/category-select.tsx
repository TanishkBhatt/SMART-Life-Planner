"use client"

import { useState } from "react"
import { CATEGORIES, getCategory } from "@/lib/categories"

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CategorySelect({ value, onChange, placeholder = "Category" }: CategorySelectProps) {
  const [isCustom, setIsCustom] = useState(false)
  const selected = getCategory(value)

  if (isCustom || (!selected && value)) {
    return (
      <div className="flex gap-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type custom category..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          autoFocus
        />
        {!isCustom && (
          <button
            type="button"
            onClick={() => { onChange(""); setIsCustom(false) }}
            className="rounded-lg border border-slate-300 px-2 text-xs text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Presets
          </button>
        )}
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === "custom") {
          setIsCustom(true)
          onChange("")
        } else {
          onChange(e.target.value)
        }
      }}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
    >
      <option value="">{placeholder}</option>
      {CATEGORIES.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.emoji} {cat.label}
        </option>
      ))}
    </select>
  )
}
