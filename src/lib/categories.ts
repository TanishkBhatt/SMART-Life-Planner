export const CATEGORIES = [
  { value: "study", label: "Study" },
  { value: "work", label: "Work" },
  { value: "health", label: "Health" },
  { value: "sports", label: "Sports" },
  { value: "entertainment", label: "Entertainment" },
  { value: "finance", label: "Finance" },
  { value: "peace", label: "Peace" },
  { value: "family", label: "Family Time" },
  { value: "custom", label: "Custom..." },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]["value"]

export function getCategory(value: string) {
  return CATEGORIES.find((c) => c.value === value)
}
