'use client'

interface RoomDetailStatsProps {
  totalVisits: number
  averageMinutes?: number | null
}

export default function RoomDetailStats({
  totalVisits,
  averageMinutes
}: RoomDetailStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Visits */}
      <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div>
            <div className="text-gray-400 text-[10px]">Návštěv</div>
            <div className="text-lg font-bold text-white">{totalVisits}</div>
          </div>
        </div>
      </div>

      {/* Average Duration */}
      <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-gray-400 text-[10px]">Průměr</div>
            <div className="text-lg font-bold text-white">
              {averageMinutes ? `${averageMinutes}m` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
