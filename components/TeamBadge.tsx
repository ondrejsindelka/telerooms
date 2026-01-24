'use client'

interface TeamBadgeProps {
  name: string
  color: string
}

export default function TeamBadge({ name, color }: TeamBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none backdrop-blur-sm"
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `3px solid ${color}`,
        color: color
      }}
      title={name}
    >
      {name}
    </span>
  )
}
