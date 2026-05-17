import { getTropeById, type TropeId } from "@/lib/trope-catalog"

interface TropeBadgeProps {
  id?: string
}

const CATEGORY_ICONS: Record<string, string> = {
  entry: "💨",
  rain: "🌧",
  dance: "💃",
  faceoff: "🍵",
  death: "💔",
  reunion: "🤗",
}

export function TropeBadge({ id }: TropeBadgeProps) {
  const def = id ? getTropeById(id) : null
  const name = def?.name ?? "Bollywood Cliché"
  const icon = (def ? CATEGORY_ICONS[def.category] : null) ?? "🎭"

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cinema-purple/10 border border-cinema-purple/15 text-[11px] text-cinema-purple-light/90 animate-fade-in">
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  )
}
