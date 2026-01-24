'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { toast } from 'sonner'
import { GET_ROOMS, GET_TEAMS, GET_HISTORY, GET_CURRENT_STATS } from '@/lib/graphql/queries'

export default function DataExport() {
  const [exporting, setExporting] = useState(false)

  const { data: roomsData } = useQuery(GET_ROOMS)
  const { data: teamsData } = useQuery(GET_TEAMS)
  const { data: historyData } = useQuery(GET_HISTORY)
  const { data: statsData } = useQuery(GET_CURRENT_STATS)

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = (data: any, filename: string) => {
    setExporting(true)
    try {
      const json = JSON.stringify(data, null, 2)
      downloadFile(json, `${filename}_${new Date().toISOString().split('T')[0]}.json`, 'application/json')
      toast.success(`${filename} exportováno do JSON!`)
    } catch (error) {
      toast.error('Chyba při exportu do JSON')
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    setExporting(true)
    try {
      if (!data || data.length === 0) {
        toast.error('Žádná data k exportu')
        return
      }

      // Get all unique keys from all objects
      const allKeys = Array.from(
        new Set(data.flatMap(obj => Object.keys(flattenObject(obj))))
      )

      // Create CSV header
      const header = allKeys.join(',')

      // Create CSV rows
      const rows = data.map(obj => {
        const flattened = flattenObject(obj)
        return allKeys.map(key => {
          const value = flattened[key]
          // Escape commas and quotes
          if (value === null || value === undefined) return ''
          const stringValue = String(value)
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      })

      const csv = [header, ...rows].join('\n')
      downloadFile(csv, `${filename}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
      toast.success(`${filename} exportováno do CSV!`)
    } catch (error) {
      toast.error('Chyba při exportu do CSV')
    } finally {
      setExporting(false)
    }
  }

  // Helper function to flatten nested objects
  const flattenObject = (obj: any, prefix = ''): any => {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const pre = prefix.length ? prefix + '_' : ''
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], pre + key))
      } else {
        acc[pre + key] = obj[key]
      }
      return acc
    }, {})
  }

  const handleExportHistory = (format: 'json' | 'csv') => {
    if (!historyData?.history) {
      toast.error('Žádná historie k exportu')
      return
    }
    if (format === 'json') {
      exportToJSON(historyData.history, 'historie')
    } else {
      exportToCSV(historyData.history, 'historie')
    }
  }

  const handleExportRooms = (format: 'json' | 'csv') => {
    if (!roomsData?.rooms) {
      toast.error('Žádné místnosti k exportu')
      return
    }
    if (format === 'json') {
      exportToJSON(roomsData.rooms, 'mistnosti')
    } else {
      exportToCSV(roomsData.rooms, 'mistnosti')
    }
  }

  const handleExportTeams = (format: 'json' | 'csv') => {
    if (!teamsData?.teams) {
      toast.error('Žádné skupiny k exportu')
      return
    }
    if (format === 'json') {
      exportToJSON(teamsData.teams, 'skupiny')
    } else {
      exportToCSV(teamsData.teams, 'skupiny')
    }
  }

  const handleExportStats = (format: 'json' | 'csv') => {
    if (!statsData?.currentStats) {
      toast.error('Žádné statistiky k exportu')
      return
    }
    if (format === 'json') {
      exportToJSON(statsData.currentStats, 'statistiky')
    } else {
      exportToCSV([statsData.currentStats], 'statistiky')
    }
  }

  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )

  return (
    <div className="space-y-4">
      {/* Historie */}
      <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-teal-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white">Historie akcí</h3>
            <p className="text-xs text-gray-400">
              {historyData?.history?.length || 0} záznamů
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportHistory('csv')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            CSV
          </button>
          <button
            onClick={() => handleExportHistory('json')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            JSON
          </button>
        </div>
      </div>

      {/* Místnosti */}
      <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-teal-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white">Místnosti</h3>
            <p className="text-xs text-gray-400">
              {roomsData?.rooms?.length || 0} místností
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportRooms('csv')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            CSV
          </button>
          <button
            onClick={() => handleExportRooms('json')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            JSON
          </button>
        </div>
      </div>

      {/* Skupiny */}
      <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-teal-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white">Skupiny</h3>
            <p className="text-xs text-gray-400">
              {teamsData?.teams?.length || 0} skupin
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportTeams('csv')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            CSV
          </button>
          <button
            onClick={() => handleExportTeams('json')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            JSON
          </button>
        </div>
      </div>

      {/* Statistiky */}
      <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-teal-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white">Aktuální statistiky</h3>
            <p className="text-xs text-gray-400">
              Obsazeno: {statsData?.currentStats?.occupiedCount || 0} |
              Rezervováno: {statsData?.currentStats?.reservedCount || 0}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportStats('csv')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            CSV
          </button>
          <button
            onClick={() => handleExportStats('json')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            JSON
          </button>
        </div>
      </div>
    </div>
  )
}
