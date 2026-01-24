'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_HISTORY } from '@/lib/graphql/queries'
import TeamBadge from './TeamBadge'

const actionLabels: Record<string, string> = {
  OCCUPY: 'Obsazeno',
  RESERVE: 'Rezervováno',
  FREE: 'Uvolněno',
  CANCEL_RESERVATION: 'Zrušena rezervace',
  ADMIN_OVERRIDE: 'Admin změna'
}

export default function HistoryTable() {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<any>({})

  const { data, loading } = useQuery(GET_HISTORY, {
    variables: { filter },
    skip: !expanded
  })

  const history = data?.history || []

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '--:--:--'

    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return '--:--:--'

    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg shadow-teal-500/5 mb-6 border border-teal-500/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-colors rounded-xl"
      >
        <div>
          <h2 className="text-xl font-bold text-teal-400">Historie změn</h2>
          <p className="text-sm text-gray-400">Záznamy o všech akcích</p>
        </div>
        <svg className="w-5 h-5 text-teal-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="p-4 border-t border-teal-500/20">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Načítání...</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Zatím žádná historie</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-700 uppercase tracking-wider">
                    <th className="pb-4 font-semibold">Čas</th>
                    <th className="pb-4 font-semibold">Skupina</th>
                    <th className="pb-4 font-semibold">Místnost</th>
                    <th className="pb-4 font-semibold">Akce</th>
                    <th className="pb-4 font-semibold">Stav</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry: any) => (
                    <tr key={entry.id} className="border-b border-gray-800 hover:bg-primary/5 transition-colors">
                      <td className="py-4 font-mono text-sm text-primary">{formatTime(entry.timestamp)}</td>
                      <td className="py-4">
                        <TeamBadge name={entry.team.name} color={entry.team.color} />
                      </td>
                      <td className="py-4 font-medium">{entry.room.name}</td>
                      <td className="py-4">
                        <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                          {actionLabels[entry.action] || entry.action}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-400 font-mono">
                        {entry.previousStatus && (
                          <>
                            <span className="text-gray-500">{entry.previousStatus}</span>
                            <span className="text-primary mx-1">→</span>
                          </>
                        )}
                        <span className="text-white">{entry.newStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
