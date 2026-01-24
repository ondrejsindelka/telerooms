'use client'

import { useQuery } from '@apollo/client'
import { GET_ROOMS, GET_CURRENT_STATS } from '@/lib/graphql/queries'
import TeamBadge from './TeamBadge'
import Timer from './Timer'

export default function AdminDashboard() {
  const { data: statsData } = useQuery(GET_CURRENT_STATS, {
    pollInterval: 5000
  })

  const { data: roomsData } = useQuery(GET_ROOMS, {
    pollInterval: 3000
  })

  const stats = statsData?.currentStats || {
    occupiedCount: 0,
    reservedCount: 0,
    totalRooms: 10,
    activeTeams: 0
  }

  const rooms = roomsData?.rooms || []

  const activeRooms = rooms.filter((room: any) =>
    (room.status === 'OCCUPIED' || room.status === 'RESERVED') && room.currentTeam
  )

  const TeamsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg shadow-teal-500/5 border border-teal-500/20">
      {/* Featured Header */}
      <div className="p-6 border-b border-teal-500/20 flex justify-between items-center bg-gradient-to-r from-teal-500/10 to-transparent rounded-t-xl">
        <div className="flex items-center gap-3">
          <TeamsIcon />
          <h2 className="font-bold text-2xl text-teal-400">Aktivní skupiny</h2>
        </div>
        <span className="text-3xl font-bold text-white">{stats.activeTeams}</span>
      </div>

      {/* Grid of Active Rooms with Timers */}
      <div className="p-6">
        {activeRooms.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>Žádné aktivní skupiny</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRooms.map((room: any) => (
              <div key={room.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-500/20 hover:border-teal-400/40 hover:bg-white/10 transition-all shadow-lg shadow-teal-500/5">
                {/* Team Badge */}
                <div className="mb-3">
                  <TeamBadge name={room.currentTeam.name} color={room.currentTeam.color} />
                </div>

                {/* Room Info */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-white mb-1">{room.name}</h3>
                  <span className={`text-xs uppercase px-2 py-1 rounded-full font-bold ${
                    room.status === 'OCCUPIED'
                      ? 'bg-status-occupied/10 text-status-occupied border border-status-occupied/20'
                      : 'bg-status-reserved/10 text-status-reserved border border-status-reserved/20'
                  }`}>
                    {room.status === 'OCCUPIED' ? 'Obsazeno' : 'Rezervováno'}
                  </span>
                </div>

                {/* Timer */}
                {room.status === 'OCCUPIED' && room.occupiedSince && (
                  <Timer type="elapsed" time={room.occupiedSince} label="Doba obsazení" />
                )}
                {room.status === 'RESERVED' && room.reservedUntil && (
                  <Timer type="countdown" time={room.reservedUntil} label="Zbývá rezervace" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 bg-teal-500/5 border-t border-teal-500/20 rounded-b-xl">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Celkové využití místností</span>
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-300">{activeRooms.length} / {stats.totalRooms}</span>
            <span className="text-xs text-gray-500">
              ({Math.round((activeRooms.length / stats.totalRooms) * 100)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
