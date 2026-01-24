'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { toast } from 'sonner'
import { CREATE_TEAM, GET_TEAMS } from '@/lib/graphql/queries'
import TeamBadge from './TeamBadge'

interface TeamSetupProps {
  onTeamCreated: (team: { id: string; name: string; color: string }) => void
}

export default function TeamSetup({ onTeamCreated }: TeamSetupProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#FF6432')
  const [createTeam, { loading: creating }] = useMutation(CREATE_TEAM)
  const { data: teamsData, loading: loadingTeams } = useQuery(GET_TEAMS, {
    pollInterval: 5000
  })

  const existingTeams = teamsData?.teams || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Zadejte název skupiny')
      return
    }

    try {
      const { data } = await createTeam({
        variables: { name: name.trim(), color }
      })

      if (data?.createTeam) {
        toast.success('Skupina úspěšně vytvořena!')
        onTeamCreated(data.createTeam)
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při vytváření skupiny')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md p-10 rounded-2xl shadow-2xl shadow-teal-500/10 max-w-4xl w-full border border-teal-500/20 flex flex-col md:flex-row gap-10">
        
        {/* Create Team Section */}
        <div className="flex-1">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
              TeleRooms
            </h1>
            <p className="text-gray-400 text-lg">
              Vytvořte novou skupinu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Název skupiny
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border-2 border-teal-500/20 rounded-xl focus:outline-none focus:border-teal-400 transition-colors text-white backdrop-blur-sm"
                placeholder="Např. Skupina A"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Barva skupiny
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-24 h-14 rounded-xl cursor-pointer border-2 border-teal-500/20 hover:border-teal-400 transition-colors"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/5 border-2 border-teal-500/20 rounded-xl focus:outline-none focus:border-teal-400 font-mono uppercase transition-colors text-white backdrop-blur-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 text-lg"
            >
              {creating ? 'Vytváření...' : 'Vytvořit skupinu'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-teal-500/20">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Název skupiny musí být unikátní<br />
              Barva slouží k identifikaci vašich místností
            </p>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/admin"
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              Přejít do Admin panelu
            </a>
          </div>
        </div>

        {/* Existing Teams Section */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-teal-500/20 pt-8 md:pt-0 md:pl-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3 text-white">
              Existující skupiny
            </h2>
            <p className="text-gray-400 text-sm">
              Klikněte pro přihlášení ke skupině
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingTeams ? (
              <p className="text-center text-gray-500">Načítání skupin...</p>
            ) : existingTeams.length === 0 ? (
              <p className="text-center text-gray-500">Zatím žádné skupiny</p>
            ) : (
              existingTeams.map((team: any) => (
                <button
                  key={team.id}
                  onClick={() => onTeamCreated(team)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 border border-teal-500/20 rounded-xl hover:border-teal-400/40 hover:bg-white/10 transition-all group backdrop-blur-sm"
                >
                  <TeamBadge name={team.name} color={team.color} />
                  <span className="text-gray-500 text-sm group-hover:text-teal-400 transition-colors">
                    Přihlásit →
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
