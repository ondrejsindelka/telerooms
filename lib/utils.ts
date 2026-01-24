export function formatElapsedTime(startTime: string): string {
  if (!startTime) return '0:00'

  const start = new Date(startTime)
  if (isNaN(start.getTime())) return '0:00'

  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / 1000)

  if (diff < 0) return '0:00'

  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatCountdown(endTime: string): string {
  if (!endTime) return '0:00'

  const end = new Date(endTime)
  if (isNaN(end.getTime())) return '0:00'

  const now = new Date()
  const diff = Math.floor((end.getTime() - now.getTime()) / 1000)

  if (diff <= 0) return '0:00'

  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getStatusEmoji(status: string): string {
  switch (status) {
    case 'FREE':
      return '🟢'
    case 'OCCUPIED':
      return '🔴'
    case 'RESERVED':
      return '🟡'
    case 'OFFLINE':
      return '⚪'
    default:
      return '❓'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'FREE':
      return 'Volná'
    case 'OCCUPIED':
      return 'Obsazená'
    case 'RESERVED':
      return 'Rezervovaná'
    case 'OFFLINE':
      return 'Offline'
    default:
      return 'Neznámý'
  }
}

// Extract number from room name (e.g., "Učebna 17" -> 17)
function extractRoomNumber(name: string): number {
  const match = name.match(/\d+/)
  return match ? parseInt(match[0], 10) : 999
}

export function sortRooms(rooms: any[], currentTeamId?: string): any[] {
  return [...rooms].sort((a, b) => {
    // Priority order based on team ownership:
    // 0 = My team's rooms (occupied/reserved by me)
    // 1 = Free rooms
    // 2 = Other team's rooms (occupied/reserved by others)
    // 3 = Offline rooms

    const getPriority = (room: any) => {
      if (room.status === 'OFFLINE') return 3

      // Check if this room belongs to current team
      const roomTeamId = room.currentTeamId || room.currentTeam?.id
      if (currentTeamId && roomTeamId && roomTeamId === currentTeamId) {
        return 0 // My team's room - TOP
      }

      if (room.status === 'FREE') return 1 // Free rooms - MIDDLE

      return 2 // Other team's rooms - BOTTOM
    }

    const priorityA = getPriority(a)
    const priorityB = getPriority(b)

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // Within same priority, sort by room number
    const numA = extractRoomNumber(a.name)
    const numB = extractRoomNumber(b.name)

    if (numA !== numB) {
      return numA - numB
    }

    // If numbers are the same, sort alphabetically
    return a.name.localeCompare(b.name)
  })
}
