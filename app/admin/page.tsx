'use client'

import { useEffect, useState } from 'react'
import { ApolloProvider, useQuery, useMutation } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import {
  GET_ROOMS,
  ADMIN_SET_ROOM_STATUS
} from '@/lib/graphql/queries'
import RoomCard from '@/components/RoomCard'
import LiveCounter from '@/components/LiveCounter'
import AdminDashboard from '@/components/AdminDashboard'
import HistoryTable from '@/components/HistoryTable'
import AdminActions from '@/components/AdminActions'
import TeamsPanel from '@/components/TeamsPanel'
import RoomManager from '@/components/RoomManager'
import DataExport from '@/components/DataExport'
import BackupManager from '@/components/BackupManager'
import { sortRooms } from '@/lib/utils'

type PanelType = 'backup' | 'export' | 'actions' | 'rooms' | 'teams' | null

function AdminContent() {
  const [rooms, setRooms] = useState<any[]>([])
  const [activePanel, setActivePanel] = useState<PanelType>(null)

  const { data: roomsData, refetch } = useQuery(GET_ROOMS, {
    pollInterval: 3000 // Poll every 3 seconds for updates
  })
  const [setRoomStatus] = useMutation(ADMIN_SET_ROOM_STATUS)

  useEffect(() => {
    if (roomsData?.rooms) {
      setRooms(sortRooms(roomsData.rooms))
    }
  }, [roomsData])

  const handleAdminAction = async (roomId: string, status: string, teamId?: string) => {
    await setRoomStatus({
      variables: { roomId, status, teamId: teamId || null }
    })
    refetch()
  }

  const stats = rooms.reduce(
    (acc, room) => {
      if (room.status === 'OCCUPIED') acc.occupiedCount++
      if (room.status === 'RESERVED') acc.reservedCount++
      if (room.status === 'FREE') acc.freeCount++
      if (room.status === 'OFFLINE') acc.offlineCount++
      return acc
    },
    {
      occupiedCount: 0,
      reservedCount: 0,
      freeCount: 0,
      offlineCount: 0,
      totalRooms: rooms.length
    }
  )

  const panelTitles: Record<Exclude<PanelType, null>, string> = {
    backup: 'Správa záloh',
    export: 'Export dat',
    actions: 'Admin akce',
    rooms: 'Správa místností',
    teams: 'Skupiny'
  }

  const toolbarButtons = [
    {
      id: 'backup' as const,
      label: 'Zálohy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      )
    },
    {
      id: 'export' as const,
      label: 'Export',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )
    },
    {
      id: 'actions' as const,
      label: 'Akce',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'rooms' as const,
      label: 'Místnosti',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'teams' as const,
      label: 'Skupiny',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400 text-lg">Správa TeleRooms</p>
          </div>
          <a
            href="/"
            className="w-full md:w-auto text-center px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-sm font-semibold shadow-lg shadow-primary/30 transition-all text-white"
          >
            ← Uživatelská verze
          </a>
        </div>

        {/* Featured Dashboard - Full Width at Top */}
        <div className="mb-6">
          <AdminDashboard />
        </div>

        {/* Toolbar with popup buttons */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {toolbarButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => setActivePanel(activePanel === button.id ? null : button.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activePanel === button.id
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-white/5 hover:bg-white/10 border border-teal-500/20 hover:border-teal-400/40 text-gray-300 hover:text-white'
              }`}
            >
              {button.icon}
              {button.label}
            </button>
          ))}
        </div>

        {/* Modal for active panel */}
        {activePanel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-8 md:pt-12 px-4">
            <div className="bg-gray-900 rounded-xl border border-teal-500/20 w-full max-w-4xl h-[90vh] flex flex-col">
              <div className="flex-shrink-0 bg-gray-900 p-4 border-b border-teal-500/20 flex justify-between items-center rounded-t-xl">
                <h3 className="text-xl font-bold text-teal-400">{panelTitles[activePanel]}</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {activePanel === 'backup' && <BackupManager />}
                {activePanel === 'export' && <DataExport />}
                {activePanel === 'actions' && <AdminActions />}
                {activePanel === 'rooms' && <RoomManager />}
                {activePanel === 'teams' && <TeamsPanel />}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Full Width */}
        <div className="space-y-6">
          <LiveCounter
            occupiedCount={stats.occupiedCount}
            reservedCount={stats.reservedCount}
            freeCount={stats.freeCount}
            offlineCount={stats.offlineCount}
            totalRooms={stats.totalRooms}
          />

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="flex flex-col">
                <RoomCard
                  room={room}
                  isAdmin={true}
                  onAdminAction={handleAdminAction}
                />
                <a
                  href={`/admin/room/${room.id}`}
                  className="mt-2 block text-center px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-xs font-medium text-primary transition-all"
                >
                  Sprava mistnosti →
                </a>
              </div>
            ))}
          </div>

          <HistoryTable />
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/cron').catch(console.error)
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <ApolloProvider client={client}>
      <AdminContent />
    </ApolloProvider>
  )
}
