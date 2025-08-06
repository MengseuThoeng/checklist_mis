import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create the 6 servers
  const servers = [
    'REPORT_36.2',
    'REPORT_154',
    'REPORT_39.20',
    'REPORT_141',
    'REPORT_39.18',
    'REPORT_130'
  ]

  for (const serverName of servers) {
    await prisma.server.upsert({
      where: { name: serverName },
      update: {},
      create: { name: serverName }
    })
  }

  console.log('✅ Seeded 6 servers successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
