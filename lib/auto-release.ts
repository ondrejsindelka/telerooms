import { prisma } from './prisma'
import { pubsub, ROOMS_UPDATED } from './graphql/pubsub'
import { RoomStatus, ActionType } from '@prisma/client'

const MAX_OCCUPATION_MS = 60 * 60 * 1000 // 60 minutes max occupation time

export async function checkAndReleaseExpiredReservations() {
  const now = new Date()
  let roomsChanged = false

  // 1. Find all expired reservations
  const expiredReservations = await prisma.room.findMany({
    where: {
      status: RoomStatus.RESERVED,
      reservedUntil: {
        lte: now
      }
    }
  })

  if (expiredReservations.length > 0) {
    console.log(`Auto-releasing ${expiredReservations.length} expired reservations`)
    roomsChanged = true

    // Release each expired reservation
    for (const room of expiredReservations) {
      const teamId = room.currentTeamId

      await prisma.room.update({
        where: { id: room.id },
        data: {
          status: RoomStatus.FREE,
          currentTeamId: null,
          reservedUntil: null
        }
      })

      if (teamId) {
        await prisma.history.create({
          data: {
            roomId: room.id,
            teamId,
            action: ActionType.CANCEL_RESERVATION,
            previousStatus: RoomStatus.RESERVED,
            newStatus: RoomStatus.FREE
          }
        })
      }
    }
  }

  // 2. Find all rooms occupied for too long (> 60 minutes)
  const maxOccupationTime = new Date(now.getTime() - MAX_OCCUPATION_MS)

  const expiredOccupations = await prisma.room.findMany({
    where: {
      status: RoomStatus.OCCUPIED,
      occupiedSince: {
        lte: maxOccupationTime
      }
    }
  })

  if (expiredOccupations.length > 0) {
    console.log(`Auto-releasing ${expiredOccupations.length} rooms occupied > 60 minutes`)
    roomsChanged = true

    for (const room of expiredOccupations) {
      const teamId = room.currentTeamId

      await prisma.room.update({
        where: { id: room.id },
        data: {
          status: RoomStatus.FREE,
          currentTeamId: null,
          occupiedSince: null
        }
      })

      if (teamId) {
        // Create FREE record to properly close the visit
        await prisma.history.create({
          data: {
            roomId: room.id,
            teamId,
            action: ActionType.FREE,
            previousStatus: RoomStatus.OCCUPIED,
            newStatus: RoomStatus.FREE
          }
        })
      }
    }
  }

  // Publish update if any rooms changed
  if (roomsChanged) {
    const allRooms = await prisma.room.findMany({ include: { currentTeam: true } })
    pubsub.publish(ROOMS_UPDATED, { roomsUpdated: allRooms })
  }
}

// Run check every minute
export function startAutoReleaseJob() {
  setInterval(async () => {
    try {
      await checkAndReleaseExpiredReservations()
    } catch (error) {
      console.error('Error in auto-release job:', error)
    }
  }, 60 * 1000) // Every minute

  console.log('Auto-release job started')
}
