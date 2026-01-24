'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { GET_TEAMS, UPDATE_TEAM, DELETE_TEAM } from '@/lib/graphql/queries'
import TeamBadge from './TeamBadge'

export default function TeamsPanel() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const { data, loading } = useQuery(GET_TEAMS, {
    pollInterval: 5000
  })

  const [updateTeam] = useMutation(UPDATE_TEAM, {
    refetchQueries: [{ query: GET_TEAMS }]
  })

  const [deleteTeam] = useMutation(DELETE_TEAM, {
    refetchQueries: [{ query: GET_TEAMS }]
  })

  const teams = data?.teams || []

  const formatDate = (dateString: string) => {
    if (!dateString) return '--'

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '--'

    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startEdit = (team: any) => {
    setEditingId(team.id)
    setEditName(team.name)
    setEditColor(team.color)
  }

  const handleUpdate = async () => {
    if (!editingId) return

    try {
      await updateTeam({
        variables: {
          id: editingId,
          name: editName,
          color: editColor
        }
      })
      toast.success('Skupina úspěšně upravena!')
      setEditingId(null)
    } catch (error: any) {
      toast.error(error.message || 'Chyba při úpravě skupiny')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Opravdu chcete smazat skupinu "${name}"? Smaže se i její historie.`)) return

    try {
      const result = await deleteTeam({ variables: { id } })
      if (result.data?.deleteTeam?.success) {
        toast.success(result.data.deleteTeam.message)
      } else {
        toast.error(result.data?.deleteTeam?.message || 'Chyba při mazání skupiny')
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při mazání skupiny')
    }
  }

  return (
    <div>
      {loading ? (
        <p className="text-center text-gray-400 py-8">Načítání...</p>
      ) : teams.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Zatím žádné skupiny</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team: any) => (
            <div
              key={team.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-500/20 hover:border-teal-400/40 transition-colors"
            >
              {editingId === team.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Název skupiny"
                    className="w-full px-3 py-2 bg-white/5 border border-teal-500/20 rounded-lg text-white focus:border-teal-400 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value.toUpperCase())}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value.toUpperCase())}
                      placeholder="#FF6432"
                      className="flex-1 px-3 py-2 bg-white/5 border border-teal-500/20 rounded-lg text-white focus:border-teal-400 focus:outline-none font-mono text-sm"
                    />
                  </div>
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
                <>
                  <div className="flex items-start justify-between mb-3">
                    <TeamBadge name={team.name} color={team.color} />
                    {team.isArchived && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        Archivován
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border-2"
                        style={{
                          backgroundColor: team.color,
                          borderColor: team.color
                        }}
                      />
                      <code className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {team.color}
                      </code>
                    </div>

                    <div className="text-gray-400 text-xs">
                      <span className="text-gray-500">Vytvořen:</span>{' '}
                      {formatDate(team.createdAt)}
                    </div>

                    <div className="text-gray-500 text-xs font-mono break-all">
                      ID: {team.id}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-teal-500/10">
                    <button
                      onClick={() => startEdit(team)}
                      className="flex-1 px-3 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-400/40 text-teal-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(team.id, team.name)}
                      className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/40 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Smazat
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
