'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { GET_BACKUPS, CREATE_BACKUP, RESTORE_BACKUP, DELETE_BACKUP } from '@/lib/graphql/queries'

export default function BackupManager() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBackupName, setNewBackupName] = useState('')
  const [newBackupDesc, setNewBackupDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const { data, loading, refetch } = useQuery(GET_BACKUPS, {
    pollInterval: 10000
  })

  const [createBackup] = useMutation(CREATE_BACKUP, {
    refetchQueries: [{ query: GET_BACKUPS }]
  })

  const [restoreBackup] = useMutation(RESTORE_BACKUP, {
    refetchQueries: [{ query: GET_BACKUPS }]
  })

  const [deleteBackup] = useMutation(DELETE_BACKUP, {
    refetchQueries: [{ query: GET_BACKUPS }]
  })

  const backups = data?.backups || []

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBackupName.trim()) {
      toast.error('Zadejte název zálohy')
      return
    }

    setIsCreating(true)
    try {
      const result = await createBackup({
        variables: {
          name: newBackupName.trim(),
          description: newBackupDesc.trim() || null
        }
      })
      toast.success(`Záloha "${result.data.createBackup.name}" vytvořena!`)
      setShowCreateModal(false)
      setNewBackupName('')
      setNewBackupDesc('')
    } catch (error: any) {
      toast.error(error.message || 'Chyba při vytváření zálohy')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Opravdu chcete obnovit zálohu "${name}"? Tato akce přepíše aktuální data.`)) return

    try {
      const result = await restoreBackup({ variables: { id } })
      if (result.data?.restoreBackup?.success) {
        toast.success(result.data.restoreBackup.message)
      } else {
        toast.error(result.data?.restoreBackup?.message || 'Chyba při obnově zálohy')
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při obnově zálohy')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Opravdu chcete smazat zálohu "${name}"? Tato akce je nevratná.`)) return

    try {
      const result = await deleteBackup({ variables: { id } })
      if (result.data?.deleteBackup?.success) {
        toast.success(result.data.deleteBackup.message)
      } else {
        toast.error(result.data?.deleteBackup?.message || 'Chyba při mazání zálohy')
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při mazání zálohy')
    }
  }

  return (
    <div className="space-y-4">
      {/* Create Backup Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full px-4 py-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-400/40 rounded-xl text-teal-400 font-medium transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Vytvořit novou zálohu
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-teal-500/20 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Vytvořit zálohu</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Název zálohy *</label>
                <input
                  type="text"
                  value={newBackupName}
                  onChange={(e) => setNewBackupName(e.target.value)}
                  placeholder="např. Záloha před resetem"
                  className="w-full px-4 py-2 bg-white/5 border border-teal-500/20 rounded-xl text-white focus:border-teal-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Popis (volitelné)</label>
                <textarea
                  value={newBackupDesc}
                  onChange={(e) => setNewBackupDesc(e.target.value)}
                  placeholder="Poznámky k záloze..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-teal-500/20 rounded-xl text-white focus:border-teal-400 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white font-bold rounded-xl transition-colors"
                >
                  {isCreating ? 'Vytvářím...' : 'Vytvořit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewBackupName('')
                    setNewBackupDesc('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backups List */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Načítání...</p>
      ) : backups.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Zatím žádné zálohy</p>
      ) : (
        <div className="space-y-3">
          {backups.map((backup: any) => (
            <div
              key={backup.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-teal-500/20 hover:border-teal-400/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-white">{backup.name}</h4>
                  {backup.description && (
                    <p className="text-sm text-gray-400 mt-1">{backup.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">{formatDate(backup.createdAt)}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded">
                  {backup.teamCount} skupin
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {backup.roomCount} místností
                </span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  {backup.historyCount} záznamů
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(backup.id, backup.name)}
                  className="flex-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-400/40 text-emerald-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Obnovit
                </button>
                <button
                  onClick={() => handleDelete(backup.id, backup.name)}
                  className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-400/40 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
