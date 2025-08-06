import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update a checklist entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing properties
    const { id: paramId } = await params
    
    // Ensure params.id exists and is valid
    if (!paramId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const id = parseInt(paramId)
    
    // Check if id is a valid number
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 })
    }

    const body = await request.json()
    
    const { date, serverId, tableName, insertStatus, updateStatus, deleteStatus, messageError, sysType } = body

    // Validate required fields
    if (!serverId || !tableName) {
      return NextResponse.json({ error: 'Server and table name are required' }, { status: 400 })
    }

    // Parse date
    const entryDate = new Date(date)

    const updatedEntry = await prisma.checklistEntry.update({
      where: { id },
      data: {
        date: entryDate,
        serverId: parseInt(serverId),
        tableName,
        insertStatus,
        updateStatus,
        deleteStatus,
        messageError: messageError || null,
        sysType: sysType || null
      },
      include: {
        server: true
      }
    })

    return NextResponse.json(updatedEntry, { status: 200 })
  } catch (error) {
    console.error('Error updating checklist entry:', error)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

// DELETE - Delete a checklist entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing properties
    const { id: paramId } = await params
    
    // Ensure params.id exists and is valid
    if (!paramId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const id = parseInt(paramId)
    
    // Check if id is a valid number
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 })
    }

    await prisma.checklistEntry.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting checklist entry:', error)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
