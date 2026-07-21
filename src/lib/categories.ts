export const CATEGORIES = [
  { value: "study", label: "Study", emoji: "📚" },
  { value: "work", label: "Work", emoji: "💼" },
  { value: "health", label: "Health", emoji: "❤️" },
  { value: "sports", label: "Sports", emoji: "🏃" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "peace", label: "Peace", emoji: "🧘" },
  { value: "family", label: "Family Time", emoji: "👨‍👩‍👧‍👦" },
  { value: "custom", label: "Custom...", emoji: "✨" },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]["value"]

export function getCategory(value: string) {
  return CATEGORIES.find((c) => c.value === value)
}
