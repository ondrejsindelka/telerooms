'use client'

import Timer from './Timer'
import TeamBadge from './TeamBadge'
import RoomVisitHistory from './RoomVisitHistory'
import RoomDetailStats from './RoomDetailStats'
import { getStatusLabel } from '@/lib/utils'

interface RoomDetailProps {
  room: any
  visitHistory: any[]
  onQuickAction: (status: string) => Promise<void>
  onBack: () => void
}

export default function RoomDetail({ room, visitHistory, onQuickAction, onBack }: RoomDetailProps) {
  // Filter and pair visits (>3 minutes)
  const validVisits = filterValidVisits(visitHistory)

  return (
    <div className="space-y-6">
      {/* Header with Back and Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-teal-500/20 hover:border-teal-400/40 rounded-xl text-sm font-medium text-gray-300 transition-all hover:text-white backdrop-blur-sm"
        >
          ← Zpět na Dashboard
        </button>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => onQuickAction('FREE')}
            className="flex-1 sm:flex-none px-4 py-2 bg-status-free hover:bg-status-free/80 text-white rounded-lg text-sm font-semibold shadow-lg shadow-status-free/30 transition-all"
          >
            Uvolnit
          </button>
          <button
            onClick={() => onQuickAction('OFFLINE')}
            className="flex-1 sm:flex-none px-4 py-2 bg-status-offline hover:bg-status-offline/80 text-white rounded-lg text-sm font-semibold shadow-lg shadow-status-offline/30 transition-all"
          >
            Offline
          </button>
        </div>
      </div>

      {/* Room Name & Description */}
      <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
        <h1 className="text-3xl font-bold text-white mb-2">{room.name}</h1>
        <p className="text-gray-400">{room.description}</p>
      </div>

      {/* Current State Card */}
      <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
        <h2 className="text-xl font-bold text-white mb-4">Aktuální stav</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Status:</span>
            <span className="px-3 py-1 rounded-full bg-teal-500/10 backdrop-blur-sm border border-teal-500/30 font-semibold text-sm">
              {getStatusLabel(room.status)}
            </span>
          </div>

          {room.status === 'OCCUPIED' && room.occupiedSince && (
            <Timer type="elapsed" time={room.occupiedSince} label="Obsazeno" size="large" />
          )}
          {room.status === 'RESERVED' && room.reservedUntil && (
            <Timer type="countdown" time={room.reservedUntil} label="Zbývá rezervace" size="large" />
          )}

          {room.currentTeam && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Drží:</span>
              <TeamBadge name={room.currentTeam.name} color={room.currentTeam.color} />
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <RoomDetailStats
        totalVisits={room.stats?.totalVisits || 0}
        averageMinutes={room.stats?.averageOccupationMinutes}
      />

      {/* Visit History */}
      <RoomVisitHistory visits={validVisits} />
    </div>
  )
}

function filterValidVisits(history: any[]) {
  const occupations = history.filter(h => h.action === 'OCCUPY')
  const visits: any[] = []

  for (const occupy of occupations) {
    const free = history.find(
      h => h.action === 'FREE' &&
           h.teamId === occupy.teamId &&
           new Date(h.timestamp) > new Date(occupy.timestamp)
    )

    if (free) {
      const duration = new Date(free.timestamp).getTime() - new Date(occupy.timestamp).getTime()
      const durationMinutes = Math.round(duration / 1000 / 60)

      if (durationMinutes >= 3) {
        visits.push({
          id: occupy.id,
          team: occupy.team,
          startTime: occupy.timestamp,
          endTime: free.timestamp,
          durationMinutes
        })
      }
    }
  }

  return visits.sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )
}
