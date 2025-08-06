import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'mengseu2004@gmail.com' }
    })

    if (existingUser) {
      console.log('Admin user already exists!')
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('DatabaseChecker2024!', 12)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: 'mengseu2004@gmail.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', user.email)
    console.log('Password: DatabaseChecker2024!')
    console.log('Role:', user.role)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
