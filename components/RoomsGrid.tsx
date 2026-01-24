'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { toast } from 'sonner'
import {
  GET_ROOMS,
  GET_TEAMS,
  OCCUPY_ROOM,
  RESERVE_ROOM,
  FREE_ROOM,
  CANCEL_RESERVATION
} from '@/lib/graphql/queries'
import RoomCard from './RoomCard'
import TeamBadge from './TeamBadge'
import { sortRooms } from '@/lib/utils'

interface RoomsGridProps {
  team: {
    id: string
    name: string
    color: string
  }
  onLogout: () => void
}

export default function RoomsGrid({ team, onLogout }: RoomsGridProps) {
  const [rooms, setRooms] = useState<any[]>([])
  const [enableTeamCheck, setEnableTeamCheck] = useState(false)

  const { data: roomsData, refetch } = useQuery(GET_ROOMS, {
    pollInterval: 3000 // Poll every 3 seconds for updates
  })
  const { data: teamsData } = useQuery(GET_TEAMS, {
    pollInterval: 5000
  })

  const [occupyRoom] = useMutation(OCCUPY_ROOM)
  const [reserveRoom] = useMutation(RESERVE_ROOM)
  const [freeRoom] = useMutation(FREE_ROOM)
  const [cancelReservation] = useMutation(CANCEL_RESERVATION)

  useEffect(() => {
    if (roomsData?.rooms) {
      setRooms(sortRooms(roomsData.rooms, team.id))
    }
  }, [roomsData, team.id])

  // Enable team existence check after initial data load (delay to allow data sync)
  useEffect(() => {
    if (teamsData?.teams) {
      // Wait 10 seconds after initial load before enabling the check
      const timer = setTimeout(() => {
        setEnableTeamCheck(true)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [teamsData])

  // Check if the current team still exists (only after initial delay)
  useEffect(() => {
    if (teamsData?.teams && enableTeamCheck) {
      const teamExists = teamsData.teams.some((t: any) => t.id === team.id)
      if (!teamExists) {
        toast.error('Tvoje skupina už neexistuje. Vyber si novou skupinu.')
        setTimeout(() => {
          onLogout()
        }, 2000)
      }
    }
  }, [teamsData, team.id, onLogout, enableTeamCheck])

  const handleOccupy = async (roomId: string) => {
    await occupyRoom({
      variables: { roomId, teamId: team.id }
    })
    refetch()
  }

  const handleReserve = async (roomId: string) => {
    await reserveRoom({
      variables: { roomId, teamId: team.id }
    })
    refetch()
  }

  const handleFree = async (roomId: string) => {
    await freeRoom({
      variables: { roomId, teamId: team.id }
    })
    refetch()
  }

  const handleCancelReservation = async (roomId: string) => {
    await cancelReservation({
      variables: { roomId, teamId: team.id }
    })
    refetch()
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Simplified for Mobile */}
        <div className="mb-4 sm:mb-6">
          {/* Title and Team Badge - Single Row on Mobile */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
                TeleRooms
              </h1>
              <TeamBadge name={team.name} color={team.color} />
            </div>

            {/* Dashboard Link - Icon Only on Small Screens */}
            <a
              href="/admin"
              className="px-3 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-400/50 rounded-xl text-xs font-bold text-teal-400 transition-all shadow-lg shadow-teal-500/20"
              title="Admin Dashboard"
            >
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
            </a>
          </div>

          {/* Change Team Button - Full Width on Mobile */}
          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white/5 hover:bg-white/10 border border-teal-500/20 hover:border-teal-400/40 rounded-xl text-xs sm:text-sm font-medium text-gray-300 transition-all hover:text-white backdrop-blur-sm"
          >
            Změnit skupinu
          </button>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              currentTeamId={team.id}
              onOccupy={handleOccupy}
              onReserve={handleReserve}
              onFree={handleFree}
              onCancelReservation={handleCancelReservation}
            />
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p>Načítání místností...</p>
          </div>
        )}
      </div>
    </div>
  )
}
