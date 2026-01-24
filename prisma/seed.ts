import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const rooms = [
  { name: "Učebna 1", description: "Grafika" },
  { name: "Učebna 3", description: "Elektronika" },
  { name: "Učebna 4", description: "Webové stránky" },
  { name: "Učebna 8", description: "Počítačové sítě" },
  { name: "Učebna 11", description: "Školní firma" },
  { name: "Učebna 17", description: "Arduino" },
  { name: "Učebna 18", description: "Databáze" },
  { name: "Učebna 26", description: "Programování, Praxe" },
  { name: "Učebna 33", description: "Optika" },
  { name: "Učebna 34", description: "Kybernetika" }
]

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.history.deleteMany()
  await prisma.room.deleteMany()
  await prisma.team.deleteMany()
  await prisma.dailyStats.deleteMany()

  // Create rooms
  for (const room of rooms) {
    await prisma.room.create({
      data: room
    })
  }

  console.log(`Seeded ${rooms.length} rooms`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
