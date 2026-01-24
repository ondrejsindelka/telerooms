'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import TeamBadge from './TeamBadge'
import Timer from './Timer'
import { getStatusEmoji, getStatusLabel } from '@/lib/utils'

interface Room {
  id: string
  name: string
  description: string
  status: string
  currentTeam?: {
    id: string
    name: string
    color: string
  }
  occupiedSince?: string
  reservedUntil?: string
  stats?: {
    averageOccupationMinutes?: number
    totalVisits: number
    lastOccupiedAt?: string
  }
}

interface RoomCardProps {
  room: Room
  currentTeamId?: string
  onOccupy?: (roomId: string) => Promise<void>
  onReserve?: (roomId: string) => Promise<void>
  onFree?: (roomId: string) => Promise<void>
  onCancelReservation?: (roomId: string) => Promise<void>
  isAdmin?: boolean
  onAdminAction?: (roomId: string, status: string, teamId?: string) => Promise<void>
}

export default function RoomCard({
  room,
  currentTeamId,
  onOccupy,
  onReserve,
  onFree,
  onCancelReservation,
  isAdmin,
  onAdminAction
}: RoomCardProps) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true)
    try {
      await action()
    } catch (error: any) {
      toast.error(error.message || 'Chyba při provádění akce')
    } finally {
      setLoading(false)
    }
  }

  const isOwnRoom = room.currentTeam?.id === currentTeamId
  const borderColor = room.currentTeam?.color || 'transparent'

  return (
    <div
      className="bg-white/5 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-5 shadow-lg shadow-teal-500/5 transition-all hover:bg-white/10 hover:shadow-xl hover:shadow-teal-500/10 border border-teal-500/20 hover:border-teal-400/40"
      style={{
        borderLeft: room.status !== 'FREE' ? `4px solid ${borderColor}` : '4px solid transparent'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg sm:text-xl text-white truncate">{room.name}</h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-0.5 sm:mt-1 font-medium truncate">{room.description}</p>
        </div>
        <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-teal-500/10 backdrop-blur-sm border border-teal-500/30 font-semibold whitespace-nowrap ml-2">
          {getStatusLabel(room.status)}
        </span>
      </div>

      {/* Timer */}
      {room.status === 'OCCUPIED' && room.occupiedSince && (
        <Timer type="elapsed" time={room.occupiedSince} label="Obsazeno" />
      )}
      {room.status === 'RESERVED' && room.reservedUntil && (
        <Timer type="countdown" time={room.reservedUntil} label="Zbývá" />
      )}

      {/* Room Statistics - Only for Admin */}
      {isAdmin && room.stats && (
        <div className="mt-4 pt-3 border-t border-teal-500/20">
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Average Occupation Time */}
            {room.stats.averageOccupationMinutes && (
              <div className="flex items-center gap-1.5 bg-teal-500/10 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-teal-500/20">
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-400">Ø</span>
                <span className="font-semibold text-white">{room.stats.averageOccupationMinutes} min</span>
              </div>
            )}

            {/* Total Visits */}
            <div className="flex items-center gap-1.5 bg-teal-500/10 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-teal-500/20">
              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-gray-400">Návštěvy:</span>
              <span className="font-semibold text-white">{room.stats.totalVisits}</span>
            </div>
          </div>
        </div>
      )}

      {/* Team Badge */}
      {room.currentTeam && (
        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-teal-500/20">
          <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mr-2">Drží:</span>
          <TeamBadge name={room.currentTeam.name} color={room.currentTeam.color} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2 flex-wrap">
        {/* Regular user actions */}
        {!isAdmin && (
          <>
            {room.status === 'FREE' && onOccupy && (
              <button
                onClick={() => handleAction(() => onOccupy(room.id))}
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-status-free text-white rounded-lg hover:bg-status-free/80 disabled:opacity-50 text-xs sm:text-sm font-semibold shadow-lg shadow-status-free/30 transition-all"
              >
                Obsadit
              </button>
            )}
            {room.status === 'FREE' && onReserve && (
              <button
                onClick={() => handleAction(() => onReserve(room.id))}
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-status-reserved text-white rounded-lg hover:bg-status-reserved/80 disabled:opacity-50 text-xs sm:text-sm font-semibold shadow-lg shadow-status-reserved/30 transition-all"
              >
                Rezervovat
              </button>
            )}
            {room.status === 'OCCUPIED' && isOwnRoom && onFree && (
              <button
                onClick={() => handleAction(() => onFree(room.id))}
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-status-occupied text-white rounded-lg hover:bg-status-occupied/80 disabled:opacity-50 text-xs sm:text-sm font-semibold shadow-lg shadow-status-occupied/30 transition-all"
              >
                Uvolnit
              </button>
            )}
            {room.status === 'RESERVED' && isOwnRoom && onCancelReservation && (
              <button
                onClick={() => handleAction(() => onCancelReservation(room.id))}
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 text-xs sm:text-sm font-semibold shadow-lg shadow-gray-600/30 transition-all"
              >
                Zrušit rezervaci
              </button>
            )}
          </>
        )}

        {/* Admin actions */}
        {isAdmin && onAdminAction && (
          <>
            <button
              onClick={() => handleAction(() => onAdminAction(room.id, 'FREE'))}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-status-free text-white rounded-lg hover:bg-status-free/80 disabled:opacity-50 text-sm font-medium transition-all"
            >
              Volná
            </button>
            <button
              onClick={() => handleAction(() => onAdminAction(room.id, room.status === 'OFFLINE' ? 'FREE' : 'OFFLINE'))}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 text-sm font-medium transition-all ${
                room.status === 'OFFLINE' 
                  ? 'bg-status-occupied hover:bg-status-occupied/80' // Green-ish when coming back online (visual cue "Turn On")
                  : 'bg-status-offline hover:bg-status-offline/80' // Grey/Red-ish when turning offline
              }`}
            >
              {room.status === 'OFFLINE' ? 'Online' : 'Offline'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
