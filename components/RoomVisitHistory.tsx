'use client'

import TeamBadge from './TeamBadge'

interface Visit {
  id: string
  team: { name: string; color: string }
  startTime: string
  endTime: string
  durationMinutes: number
}

interface RoomVisitHistoryProps {
  visits: Visit[]
}

export default function RoomVisitHistory({ visits }: RoomVisitHistoryProps) {
  if (visits.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
        <h2 className="text-xl font-bold text-white mb-4">Historie návštěv</h2>
        <p className="text-gray-400">Žádné návštěvy delší než 3 minuty.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
      <h2 className="text-xl font-bold text-white mb-4">Historie návštěv ({visits.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-teal-500/20 text-left">
              <th className="py-3 px-2 text-sm font-medium text-gray-400">Tým</th>
              <th className="py-3 px-2 text-sm font-medium text-gray-400">Začátek</th>
              <th className="py-3 px-2 text-sm font-medium text-gray-400">Konec</th>
              <th className="py-3 px-2 text-sm font-medium text-gray-400">Doba</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(visit => (
              <tr key={visit.id} className="border-b border-teal-500/10 hover:bg-white/5">
                <td className="py-3 px-2">
                  <TeamBadge name={visit.team.name} color={visit.team.color} />
                </td>
                <td className="py-3 px-2 text-sm text-gray-300">{formatDateTime(visit.startTime)}</td>
                <td className="py-3 px-2 text-sm text-gray-300">{formatDateTime(visit.endTime)}</td>
                <td className="py-3 px-2 text-sm font-semibold text-teal-400">{visit.durationMinutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
