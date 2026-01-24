'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { GET_ROOMS, CREATE_ROOM, DELETE_ROOM, UPDATE_ROOM } from '@/lib/graphql/queries'

export default function RoomManager() {
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const { data, loading } = useQuery(GET_ROOMS)

  const [createRoom] = useMutation(CREATE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  })
  const [deleteRoom] = useMutation(DELETE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  })
  const [updateRoom] = useMutation(UPDATE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  })

  const rooms = data?.rooms || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim()) return

    try {
      await createRoom({
        variables: {
          name: newRoomName.trim(),
          description: newRoomDesc.trim() || 'Bez popisu'
        }
      })
      toast.success('Místnost úspěšně vytvořena!')
      setNewRoomName('')
      setNewRoomDesc('')
    } catch (error) {
      toast.error('Chyba při vytváření místnosti')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Opravdu chcete smazat místnost "${name}"? Smaže se i její historie.`)) return

    try {
      await deleteRoom({ variables: { id } })
      toast.success('Místnost úspěšně smazána!')
    } catch (error) {
      toast.error('Chyba při mazání místnosti')
    }
  }

  const startEdit = (room: any) => {
    setEditingId(room.id)
    setEditName(room.name)
    setEditDesc(room.description)
  }

  const handleUpdate = async () => {
    if (!editingId) return

    try {
      await updateRoom({
        variables: {
          id: editingId,
          name: editName,
          description: editDesc
        }
      })
      toast.success('Místnost úspěšně upravena!')
      setEditingId(null)
    } catch (error) {
      toast.error('Chyba při úpravě místnosti')
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Room Form */}
      <form onSubmit={handleCreate} className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-teal-500/20">
        <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nová místnost
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Název / Číslo místnosti"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-teal-500/20 rounded-xl focus:border-teal-400 focus:outline-none text-white"
            required
          />
          <input
            type="text"
            placeholder="Popis (volitelné)"
            value={newRoomDesc}
            onChange={(e) => setNewRoomDesc(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-teal-500/20 rounded-xl focus:border-teal-400 focus:outline-none text-white"
          />
          <button
            type="submit"
            className="w-full px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Přidat místnost
          </button>
        </div>
      </form>

      {/* Rooms List */}
      {loading ? (
        <p className="text-center text-gray-400 py-4">Načítání...</p>
      ) : rooms.length === 0 ? (
        <p className="text-center text-gray-400 py-4">Zatím žádné místnosti</p>
      ) : (
        <div className="space-y-3">
          {rooms.map((room: any) => (
            <div
              key={room.id}
              className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-teal-500/20 hover:border-teal-400/40 transition-all"
            >
              {editingId === room.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Název místnosti"
                    className="w-full px-3 py-2 bg-white/5 border border-teal-500/20 rounded-lg text-white focus:border-teal-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Popis"
                    className="w-full px-3 py-2 bg-white/5 border border-teal-500/20 rounded-lg text-white focus:border-teal-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Uložit
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Zrušit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white block truncate">{room.name}</span>
                    <span className="text-gray-400 text-sm block truncate">{room.description}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(room)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-400/40 text-teal-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden sm:inline">Upravit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(room.id, room.name)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/40 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Smazat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
