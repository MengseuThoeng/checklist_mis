import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create the 6 servers
  const servers = [
    'REPORT_36.2',
    'REPORT_154',
    'REPORT_39.20',
    'REPORT_141',
    'REPORT_39.18',
    'REPORT_130'
  ]

  console.log('📊 Creating servers...')
  for (const serverName of servers) {
    await prisma.server.upsert({
      where: { name: serverName },
      update: {},
      create: { name: serverName }
    })
  }

  // Create admin user if doesn't exist
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash('DatabaseChecker2024!', 12)
  
  await prisma.user.upsert({
    where: { email: 'mengseu2004@gmail.com' },
    update: {},
    create: {
      email: 'mengseu2004@gmail.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('✅ Seeded servers and admin user successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
