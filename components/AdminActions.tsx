'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { ADMIN_ARCHIVE_AND_RESET } from '@/lib/graphql/queries'

export default function AdminActions() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteTeams, setDeleteTeams] = useState(false)

  const [archiveAndReset, { loading }] = useMutation(ADMIN_ARCHIVE_AND_RESET)

  const handleReset = async () => {
    try {
      const { data } = await archiveAndReset({
        variables: { deleteTeams }
      })

      if (data?.adminArchiveAndReset?.success) {
        toast.success(data.adminArchiveAndReset.message)
        setShowConfirm(false)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při archivaci')
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
      >
        Resetovat místnosti
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl max-w-md w-full border-2 border-red-500/50 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-red-400">Potvrzení</h3>
            <p className="text-gray-300 mb-6">
              Tato akce archivuje celou historii, vytvoří denní statistiky a resetuje všechny místnosti na volné.
            </p>

            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-red-500/20 hover:border-red-400/40 transition-colors">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={deleteTeams}
                  onChange={(e) => setDeleteTeams(e.target.checked)}
                  className="w-5 h-5 mr-3 mt-0.5 cursor-pointer accent-red-600"
                />
                <div>
                  <span className="text-red-400 font-medium group-hover:text-red-300 transition-colors">Smazat všechny skupiny</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Pokud zaškrtnete, všechny skupiny budou TRVALE SMAZÁNY včetně historie. Poté můžete vytvořit nové skupiny se stejnými názvy.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Zpracování...' : 'Potvrdit'}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setDeleteTeams(false)
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-bold rounded-xl transition-all"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
