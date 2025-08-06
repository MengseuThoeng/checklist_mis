import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch checklist entries for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    // Parse the date and create start/end of day
    const date = new Date(dateParam)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const entries = await prisma.checklistEntry.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        server: true
      },
      orderBy: [
        { server: { name: 'asc' } },
        { tableName: 'asc' }
      ]
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching checklist entries:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

// POST - Create a new checklist entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, serverId, tableName, insertStatus, updateStatus, deleteStatus, messageError, sysType } = body

    if (!date || !serverId || !tableName) {
      return NextResponse.json({ error: 'Date, serverId, and tableName are required' }, { status: 400 })
    }

    const entry = await prisma.checklistEntry.create({
      data: {
        date: new Date(date),
        serverId: parseInt(serverId),
        tableName,
        insertStatus: insertStatus,
        updateStatus: updateStatus,
        deleteStatus: deleteStatus,
        messageError: messageError || null,
        sysType: sysType || null
      },
      include: {
        server: true
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creating checklist entry:', error)
    
    // Check if it's a unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ 
        error: 'Entry already exists for this date, server, and table' 
      }, { status: 409 })
    }
    
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}
