'use client'

interface LiveCounterProps {
  occupiedCount: number
  reservedCount: number
  freeCount: number
  offlineCount: number
  totalRooms: number
}

export default function LiveCounter({
  occupiedCount,
  reservedCount,
  freeCount,
  offlineCount,
  totalRooms
}: LiveCounterProps) {

  const occupiedPercent = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0
  const reservedPercent = totalRooms > 0 ? (reservedCount / totalRooms) * 100 : 0
  const freePercent = totalRooms > 0 ? (freeCount / totalRooms) * 100 : 0
  const offlinePercent = totalRooms > 0 ? (offlineCount / totalRooms) * 100 : 0

  return (
    <div className="bg-white/5 backdrop-blur-md p-2 sm:p-3 rounded-xl border border-teal-500/20 mb-3 sm:mb-4 shadow-lg shadow-teal-500/5">
      {/* 4-column grid - Compact on Mobile */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-1.5">
        <div className="text-center py-1 bg-status-occupied/5 rounded-lg border border-status-occupied/20">
          <div className="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5 sm:mb-1">Obsazeno</div>
          <div className="text-xl sm:text-2xl font-bold text-status-occupied leading-none">{occupiedCount}</div>
        </div>

        <div className="text-center py-1 bg-status-reserved/5 rounded-lg border border-status-reserved/20">
          <div className="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5 sm:mb-1">Rezerv.</div>
          <div className="text-xl sm:text-2xl font-bold text-status-reserved leading-none">{reservedCount}</div>
        </div>

        <div className="text-center py-1 bg-status-free/5 rounded-lg border border-status-free/20">
          <div className="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5 sm:mb-1">Volno</div>
          <div className="text-xl sm:text-2xl font-bold text-status-free leading-none">{freeCount}</div>
        </div>

        <div className="text-center py-1 bg-status-offline/5 rounded-lg border border-status-offline/20">
          <div className="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5 sm:mb-1">Offline</div>
          <div className="text-xl sm:text-2xl font-bold text-status-offline leading-none">{offlineCount}</div>
        </div>
      </div>

      {/* 4-segment progress bar */}
      <div className="h-2 bg-teal-900/50 rounded-full overflow-hidden flex w-full">
        <div
          className="h-full bg-status-occupied transition-all duration-500 ease-out"
          style={{ width: `${occupiedPercent}%` }}
        />
        <div
          className="h-full bg-status-reserved transition-all duration-500 ease-out"
          style={{ width: `${reservedPercent}%` }}
        />
        <div
          className="h-full bg-status-free transition-all duration-500 ease-out"
          style={{ width: `${freePercent}%` }}
        />
        <div
          className="h-full bg-status-offline transition-all duration-500 ease-out"
          style={{ width: `${offlinePercent}%` }}
        />
      </div>

      {/* Utilization percentage */}
      <div className="mt-1 text-center text-[9px] sm:text-[10px] text-gray-500">
        {Math.round(((occupiedCount + reservedCount) / totalRooms) * 100)}% využito
      </div>
    </div>
  )
}
