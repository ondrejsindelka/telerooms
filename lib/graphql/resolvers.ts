import { prisma } from '../prisma'
import { pubsub, ROOMS_UPDATED } from './pubsub'
import { RoomStatus, ActionType } from '@prisma/client'

const RESERVATION_DURATION_MS = 5 * 60 * 1000 // 5 minutes

async function calculateRoomStats(roomId: string) {
  // Get all OCCUPY actions for this room (non-archived)
  const occupations = await prisma.history.findMany({
    where: {
      roomId,
      action: ActionType.OCCUPY,
      archivedDate: null
    },
    orderBy: { timestamp: 'desc' }
  })

  const MIN_DURATION_MS = 3 * 60 * 1000 // 3 minutes - only count visits >= 3 min

  // Calculate average occupation time by matching OCCUPY with FREE
  let totalDurationMs = 0
  let validVisitsCount = 0 // Only count visits >= 3 minutes

  for (const occupy of occupations) {
    const freeAction = await prisma.history.findFirst({
      where: {
        roomId,
        teamId: occupy.teamId,
        action: ActionType.FREE,
        timestamp: { gt: occupy.timestamp }
      },
      orderBy: { timestamp: 'asc' }
    })

    if (freeAction) {
      const duration = freeAction.timestamp.getTime() - occupy.timestamp.getTime()

      // Only count visits that lasted >= 3 minutes
      if (duration >= MIN_DURATION_MS) {
        totalDurationMs += duration
        validVisitsCount++
      }
    }
  }

  const averageOccupationMinutes = validVisitsCount > 0
    ? Math.round(totalDurationMs / validVisitsCount / 1000 / 60)
    : null

  return {
    roomId,
    averageOccupationMinutes,
    totalVisits: validVisitsCount,
    lastOccupiedAt: occupations[0]?.timestamp?.toISOString() || null
  }
}

export const resolvers = {
  // Custom type resolvers to ensure proper date serialization
  Room: {
    occupiedSince: (parent: any) => parent.occupiedSince?.toISOString() || null,
    reservedUntil: (parent: any) => parent.reservedUntil?.toISOString() || null,
    updatedAt: (parent: any) => parent.updatedAt?.toISOString() || null,
    stats: async (parent: any) => {
      return calculateRoomStats(parent.id)
    },
  },
  Team: {
    createdAt: (parent: any) => parent.createdAt?.toISOString() || null,
  },
  History: {
    timestamp: (parent: any) => parent.timestamp?.toISOString() || null,
    archivedDate: (parent: any) => parent.archivedDate?.toISOString() || null,
  },
  DailyStats: {
    date: (parent: any) => parent.date?.toISOString() || null,
    teamActivity: (parent: any) => JSON.stringify(parent.teamActivity)
  },

  Query: {
    rooms: async () => {
      return await prisma.room.findMany({
        include: { currentTeam: true },
        orderBy: { name: 'asc' }
      })
    },

    teams: async () => {
      return await prisma.team.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' }
      })
    },

    history: async (_: any, { filter }: any) => {
      const where: any = { archivedDate: null }

      if (filter?.teamId) where.teamId = filter.teamId
      if (filter?.roomId) where.roomId = filter.roomId
      if (filter?.action) where.action = filter.action

      return await prisma.history.findMany({
        where,
        include: { room: true, team: true },
        orderBy: { timestamp: 'desc' },
        take: 100
      })
    },

    dailyStats: async (_: any, { date }: any) => {
      if (!date) return null
      return await prisma.dailyStats.findUnique({
        where: { date: new Date(date) }
      })
    },

    currentStats: async () => {
      const rooms = await prisma.room.findMany()
      const teams = await prisma.team.findMany({ where: { isArchived: false } })

      return {
        occupiedCount: rooms.filter(r => r.status === 'OCCUPIED').length,
        reservedCount: rooms.filter(r => r.status === 'RESERVED').length,
        freeCount: rooms.filter(r => r.status === 'FREE').length,
        offlineCount: rooms.filter(r => r.status === 'OFFLINE').length,
        totalRooms: rooms.length,
        activeTeams: teams.length
      }
    },

    backups: async () => {
      const backups = await prisma.backup.findMany({
        orderBy: { createdAt: 'desc' }
      })

      return backups.map(backup => {
        const data = backup.data as any
        return {
          id: backup.id,
          name: backup.name,
          description: backup.description,
          createdAt: backup.createdAt.toISOString(),
          teamCount: data.teams?.length || 0,
          roomCount: data.rooms?.length || 0,
          historyCount: data.history?.length || 0
        }
      })
    }
  },

  Mutation: {
    createTeam: async (_: any, { name, color }: any) => {
      // Check if team name already exists
      const existing = await prisma.team.findUnique({ where: { name } })
      if (existing) {
        throw new Error('Skupina s tímto názvem již existuje')
      }

      // Validate hex color
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        throw new Error('Neplatný formát barvy (použijte #RRGGBB)')
      }

      return await prisma.team.create({
        data: { name, color }
      })
    },

    updateTeam: async (_: any, { id, name, color }: any) => {
      // Check if team exists
      const existing = await prisma.team.findUnique({ where: { id } })
      if (!existing) {
        throw new Error('Skupina nebyla nalezena')
      }

      // If changing name, check for duplicates
      if (name && name !== existing.name) {
        const duplicate = await prisma.team.findUnique({ where: { name } })
        if (duplicate) {
          throw new Error('Skupina s tímto názvem již existuje')
        }
      }

      // Validate hex color if provided
      if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
        throw new Error('Neplatný formát barvy (použijte #RRGGBB)')
      }

      return await prisma.team.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(color && { color })
        }
      })
    },

    deleteTeam: async (_: any, { id }: any) => {
      // Check if team exists
      const existing = await prisma.team.findUnique({ where: { id } })
      if (!existing) {
        return {
          success: false,
          message: 'Skupina nebyla nalezena'
        }
      }

      // Check if team has active rooms
      const activeRooms = await prisma.room.findMany({
        where: { currentTeamId: id }
      })

      if (activeRooms.length > 0) {
        // Free all rooms first
        await prisma.room.updateMany({
          where: { currentTeamId: id },
          data: {
            status: RoomStatus.FREE,
            currentTeamId: null,
            occupiedSince: null,
            reservedUntil: null
          }
        })
      }

      // Delete all history for this team
      await prisma.history.deleteMany({
        where: { teamId: id }
      })

      // Delete the team
      await prisma.team.delete({
        where: { id }
      })

      // Publish room updates if rooms were freed
      if (activeRooms.length > 0) {
        const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
        pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
      }

      return {
        success: true,
        message: `Skupina "${existing.name}" byla úspěšně smazána`
      }
    },

    occupyRoom: async (_: any, { roomId, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })
      const team = await prisma.team.findUnique({ where: { id: teamId } })

      if (!room || !team) {
        throw new Error('Místnost nebo skupina nebyl nalezen')
      }

      if (room.status !== RoomStatus.FREE) {
        throw new Error('Místnost není volná')
      }

      // Check if team already has an OCCUPIED room (allow max 1 occupied room)
      // Note: We allow having a reservation AND an occupied room simultaneously as per requirements
      const activeOccupation = await prisma.room.findFirst({
        where: {
          currentTeamId: teamId,
          status: RoomStatus.OCCUPIED
        }
      })

      if (activeOccupation) {
        throw new Error('Skupina již obsadila jinou místnost (max 1)')
      }

      // Update room
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: RoomStatus.OCCUPIED,
          currentTeamId: teamId,
          occupiedSince: new Date()
        },
        include: { currentTeam: true }
      })

      // Create history record
      await prisma.history.create({
        data: {
          roomId,
          teamId,
          action: ActionType.OCCUPY,
          previousStatus: RoomStatus.FREE,
          newStatus: RoomStatus.OCCUPIED
        }
      })

      // Publish update
      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    reserveRoom: async (_: any, { roomId, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })
      const team = await prisma.team.findUnique({ where: { id: teamId } })

      if (!room || !team) {
        throw new Error('Místnost nebo skupina nebyl nalezen')
      }

      if (room.status !== RoomStatus.FREE) {
        throw new Error('Místnost není volná')
      }

      // Check if team already has a reservation
      const existingReservation = await prisma.room.findFirst({
        where: {
          currentTeamId: teamId,
          status: RoomStatus.RESERVED
        }
      })

      if (existingReservation) {
        throw new Error('Skupina může mít pouze jednu aktivní rezervaci')
      }

      // Reserve for 5 minutes
      const reservedUntil = new Date(Date.now() + RESERVATION_DURATION_MS)

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: RoomStatus.RESERVED,
          currentTeamId: teamId,
          reservedUntil
        },
        include: { currentTeam: true }
      })

      await prisma.history.create({
        data: {
          roomId,
          teamId,
          action: ActionType.RESERVE,
          previousStatus: RoomStatus.FREE,
          newStatus: RoomStatus.RESERVED
        }
      })

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    freeRoom: async (_: any, { roomId, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })

      if (!room) {
        throw new Error('Místnost nebyla nalezena')
      }

      if (room.currentTeamId !== teamId) {
        throw new Error('Pouze vlastník může uvolnit místnost')
      }

      if (room.status !== RoomStatus.OCCUPIED && room.status !== RoomStatus.RESERVED) {
        throw new Error('Místnost není obsazená ani rezervovaná')
      }

      const previousStatus = room.status

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: RoomStatus.FREE,
          currentTeamId: null,
          occupiedSince: null,
          reservedUntil: null
        },
        include: { currentTeam: true }
      })

      await prisma.history.create({
        data: {
          roomId,
          teamId,
          action: ActionType.FREE,
          previousStatus,
          newStatus: RoomStatus.FREE
        }
      })

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    cancelReservation: async (_: any, { roomId, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })

      if (!room) {
        throw new Error('Místnost nebyla nalezena')
      }

      if (room.currentTeamId !== teamId) {
        throw new Error('Pouze vlastník může zrušit rezervaci')
      }

      if (room.status !== RoomStatus.RESERVED) {
        throw new Error('Místnost není rezervovaná')
      }

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: RoomStatus.FREE,
          currentTeamId: null,
          reservedUntil: null
        },
        include: { currentTeam: true }
      })

      await prisma.history.create({
        data: {
          roomId,
          teamId,
          action: ActionType.CANCEL_RESERVATION,
          previousStatus: RoomStatus.RESERVED,
          newStatus: RoomStatus.FREE
        }
      })

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    adminSetRoomStatus: async (_: any, { roomId, status, teamId }: any) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } })

      if (!room) {
        throw new Error('Místnost nebyla nalezena')
      }

      const previousStatus = room.status
      const updateData: any = { status }

      if (status === RoomStatus.FREE || status === RoomStatus.OFFLINE) {
        updateData.currentTeamId = null
        updateData.occupiedSince = null
        updateData.reservedUntil = null
      } else if (teamId) {
        updateData.currentTeamId = teamId
        if (status === RoomStatus.OCCUPIED) {
          updateData.occupiedSince = new Date()
        } else if (status === RoomStatus.RESERVED) {
          updateData.reservedUntil = new Date(Date.now() + RESERVATION_DURATION_MS)
        }
      }

      // If room was occupied/reserved and we're freeing it, create FREE record for the original team
      const originalTeamId = room.currentTeamId

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: updateData,
        include: { currentTeam: true }
      })

      // Create history record
      if (status === RoomStatus.FREE && originalTeamId && (previousStatus === RoomStatus.OCCUPIED || previousStatus === RoomStatus.RESERVED)) {
        // Admin freed an occupied/reserved room - create FREE record to close the visit
        await prisma.history.create({
          data: {
            roomId,
            teamId: originalTeamId,
            action: ActionType.FREE,
            previousStatus,
            newStatus: status
          }
        })
      } else if (status === RoomStatus.OFFLINE && originalTeamId && (previousStatus === RoomStatus.OCCUPIED || previousStatus === RoomStatus.RESERVED)) {
        // Admin set to offline - also close the visit
        await prisma.history.create({
          data: {
            roomId,
            teamId: originalTeamId,
            action: ActionType.FREE,
            previousStatus,
            newStatus: status
          }
        })
      } else if (teamId) {
        await prisma.history.create({
          data: {
            roomId,
            teamId,
            action: ActionType.ADMIN_OVERRIDE,
            previousStatus,
            newStatus: status
          }
        })
      }

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return updatedRoom
    },

    adminArchiveAndReset: async (_: any, { deleteTeams }: any) => {
      // Archive all history
      const historyCount = await prisma.history.updateMany({
        where: { archivedDate: null },
        data: { archivedDate: new Date() }
      })

      // Create daily stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const history = await prisma.history.findMany({
        where: {
          archivedDate: { not: null },
          timestamp: { gte: today }
        }
      })

      const occupations = history.filter(h => h.action === ActionType.OCCUPY).length
      const reservations = history.filter(h => h.action === ActionType.RESERVE).length

      // Calculate team activity
      const teamActivity: Record<string, number> = {}
      history.forEach(h => {
        teamActivity[h.teamId] = (teamActivity[h.teamId] || 0) + 1
      })

      // Find most popular room
      const roomCounts: Record<string, number> = {}
      history.forEach(h => {
        roomCounts[h.roomId] = (roomCounts[h.roomId] || 0) + 1
      })
      const mostPopularRoomId = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

      await prisma.dailyStats.upsert({
        where: { date: today },
        update: {
          totalOccupations: occupations,
          totalReservations: reservations,
          mostPopularRoomId,
          teamActivity: teamActivity
        },
        create: {
          date: today,
          totalOccupations: occupations,
          totalReservations: reservations,
          mostPopularRoomId,
          teamActivity: teamActivity
        }
      })

      // Reset all rooms
      await prisma.room.updateMany({
        data: {
          status: RoomStatus.FREE,
          currentTeamId: null,
          occupiedSince: null,
          reservedUntil: null
        }
      })

      // Optionally delete teams completely
      let deletedTeamsCount = 0
      if (deleteTeams) {
        // Delete all history records first (to avoid FK constraint issues)
        await prisma.history.deleteMany({})

        // Delete all teams
        const deleteResult = await prisma.team.deleteMany({})
        deletedTeamsCount = deleteResult.count
      }

      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

      return {
        success: true,
        archivedHistoryCount: historyCount.count,
        message: `Archivováno ${historyCount.count} záznamů. ${deleteTeams ? `Smazáno ${deletedTeamsCount} skupin.` : 'Skupiny zachovány.'}`
      }
    },

    adminRestoreTeamsFromArchive: async () => {
      // Restore all archived teams
      const result = await prisma.team.updateMany({
        where: { isArchived: true },
        data: { isArchived: false }
      })

      return {
        success: true,
        restoredCount: result.count,
        message: `Obnoveno ${result.count} skupin z archivu`
      }
    },

    adminClearArchive: async () => {
      // Delete all archived history
      const archivedHistory = await prisma.history.deleteMany({
        where: { archivedDate: { not: null } }
      })

      // Delete all daily stats
      const dailyStats = await prisma.dailyStats.deleteMany()

      // Delete all archived teams
      const archivedTeams = await prisma.team.deleteMany({
        where: { isArchived: true }
      })

      return {
        success: true,
        deletedHistory: archivedHistory.count,
        deletedStats: dailyStats.count,
        deletedTeams: archivedTeams.count,
        message: `Vymazáno: ${archivedHistory.count} záznamů historie, ${dailyStats.count} denních statistik, ${archivedTeams.count} archivovaných skupin`
      }
    },

    createRoom: async (_: any, { name, description }: any) => {
      const room = await prisma.room.create({
        data: { name, description, status: RoomStatus.FREE }
      })
      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
      return room
    },

    updateRoom: async (_: any, { id, name, description }: any) => {
      const room = await prisma.room.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description })
        }
      })
      const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
      pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
      return room
    },

    deleteRoom: async (_: any, { id }: any) => {
      try {
        await prisma.history.deleteMany({ where: { roomId: id } })
        await prisma.room.delete({ where: { id } })
        const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
        pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
        return true
      } catch (e) {
        return false
      }
    },

    createBackup: async (_: any, { name, description }: any) => {
      // Gather all data
      const teams = await prisma.team.findMany()
      const rooms = await prisma.room.findMany()
      const history = await prisma.history.findMany({
        where: { archivedDate: null }
      })

      const data = {
        teams: teams.map(t => ({
          id: t.id,
          name: t.name,
          color: t.color,
          createdAt: t.createdAt.toISOString(),
          isArchived: t.isArchived
        })),
        rooms: rooms.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          status: r.status,
          currentTeamId: r.currentTeamId,
          occupiedSince: r.occupiedSince?.toISOString() || null,
          reservedUntil: r.reservedUntil?.toISOString() || null
        })),
        history: history.map(h => ({
          id: h.id,
          roomId: h.roomId,
          teamId: h.teamId,
          action: h.action,
          timestamp: h.timestamp.toISOString(),
          previousStatus: h.previousStatus,
          newStatus: h.newStatus
        }))
      }

      const backup = await prisma.backup.create({
        data: {
          name,
          description,
          data
        }
      })

      return {
        id: backup.id,
        name: backup.name,
        description: backup.description,
        createdAt: backup.createdAt.toISOString(),
        teamCount: data.teams.length,
        roomCount: data.rooms.length,
        historyCount: data.history.length
      }
    },

    restoreBackup: async (_: any, { id }: any) => {
      const backup = await prisma.backup.findUnique({ where: { id } })

      if (!backup) {
        return {
          success: false,
          message: 'Záloha nebyla nalezena'
        }
      }

      const data = backup.data as any

      try {
        // Clear current data
        await prisma.history.deleteMany({ where: { archivedDate: null } })

        // Reset all rooms
        await prisma.room.updateMany({
          data: {
            status: RoomStatus.FREE,
            currentTeamId: null,
            occupiedSince: null,
            reservedUntil: null
          }
        })

        // Delete teams that don't exist in backup
        const backupTeamIds = data.teams.map((t: any) => t.id)
        await prisma.team.deleteMany({
          where: { id: { notIn: backupTeamIds } }
        })

        // Restore teams
        for (const team of data.teams) {
          await prisma.team.upsert({
            where: { id: team.id },
            create: {
              id: team.id,
              name: team.name,
              color: team.color,
              createdAt: new Date(team.createdAt),
              isArchived: team.isArchived
            },
            update: {
              name: team.name,
              color: team.color,
              isArchived: team.isArchived
            }
          })
        }

        // Restore rooms state
        for (const room of data.rooms) {
          const existingRoom = await prisma.room.findUnique({ where: { id: room.id } })
          if (existingRoom) {
            await prisma.room.update({
              where: { id: room.id },
              data: {
                status: room.status,
                currentTeamId: room.currentTeamId,
                occupiedSince: room.occupiedSince ? new Date(room.occupiedSince) : null,
                reservedUntil: room.reservedUntil ? new Date(room.reservedUntil) : null
              }
            })
          }
        }

        // Restore history
        for (const h of data.history) {
          const roomExists = await prisma.room.findUnique({ where: { id: h.roomId } })
          const teamExists = await prisma.team.findUnique({ where: { id: h.teamId } })

          if (roomExists && teamExists) {
            await prisma.history.create({
              data: {
                id: h.id,
                roomId: h.roomId,
                teamId: h.teamId,
                action: h.action,
                timestamp: new Date(h.timestamp),
                previousStatus: h.previousStatus,
                newStatus: h.newStatus
              }
            })
          }
        }

        // Publish room updates
        const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
        pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })

        return {
          success: true,
          message: `Záloha "${backup.name}" byla úspěšně obnovena`
        }
      } catch (error: any) {
        return {
          success: false,
          message: `Chyba při obnově: ${error.message}`
        }
      }
    },

    deleteBackup: async (_: any, { id }: any) => {
      const backup = await prisma.backup.findUnique({ where: { id } })

      if (!backup) {
        return {
          success: false,
          message: 'Záloha nebyla nalezena'
        }
      }

      await prisma.backup.delete({ where: { id } })

      return {
        success: true,
        message: `Záloha "${backup.name}" byla úspěšně smazána`
      }
    }
  },

  Subscription: {
    roomsUpdated: {
      subscribe: () => pubsub.asyncIterator([ROOMS_UPDATED])
    }
  }
}
