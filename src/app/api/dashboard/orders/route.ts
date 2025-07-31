import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const now = new Date()
    
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    const fiveDays = new Date(now)
    fiveDays.setDate(now.getDate() + 5)
    fiveDays.setHours(23, 59, 59, 999)

    const tenDays = new Date(now)
    tenDays.setDate(now.getDate() + 10)
    tenDays.setHours(23, 59, 59, 999)

    const [dueIn1Day, dueIn5Days, dueIn10Days, allPending] = await Promise.all([
      prisma.order.findMany({
        where: { status: 'PENDING', dueDate: { gte: now, lte: tomorrow } },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.order.findMany({
        where: { status: 'PENDING', dueDate: { gt: tomorrow, lte: fiveDays } },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.order.findMany({
        where: { status: 'PENDING', dueDate: { gt: fiveDays, lte: tenDays } },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.order.findMany({
        where: { status: 'PENDING' },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
    ])

    return NextResponse.json({
      dueIn1Day,
      dueIn5Days,
      dueIn10Days,
      allPending,
    })
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}