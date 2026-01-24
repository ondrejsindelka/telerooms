'use client'

import { useEffect, useState } from 'react'
import { formatElapsedTime, formatCountdown } from '@/lib/utils'

interface TimerProps {
  type: 'elapsed' | 'countdown'
  time: string
  label: string
  size?: 'normal' | 'large'
}

export default function Timer({ type, time, label, size = 'normal' }: TimerProps) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      if (type === 'elapsed') {
        setDisplay(formatElapsedTime(time))
      } else {
        setDisplay(formatCountdown(time))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [type, time])

  if (size === 'large') {
    return (
      <div className="flex items-center gap-3 bg-teal-500/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-teal-500/20">
        <span className="text-gray-400 text-lg">{label}:</span>
        <span className="font-mono font-bold text-teal-400 text-2xl sm:text-3xl">{display}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-teal-500/10 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-teal-500/20">
      <span className="text-gray-400">{label}:</span>
      <span className="font-mono font-bold text-teal-400">{display}</span>
    </div>
  )
}
