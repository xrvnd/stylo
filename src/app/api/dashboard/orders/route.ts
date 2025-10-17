import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const now = new Date();

    // Define the start and end of the current day
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Define the end of the 5-day and 10-day periods from today
    const endOf5Days = new Date(now);
    endOf5Days.setDate(now.getDate() + 5);
    endOf5Days.setHours(23, 59, 59, 999);

    const endOf10Days = new Date(now);
    endOf10Days.setDate(now.getDate() + 10);
    endOf10Days.setHours(23, 59, 59, 999);

    const [dueToday, dueIn5Days, dueIn10Days, allPending] = await Promise.all([
      prisma.order.findMany({
        where: { 
          status: 'PENDING', 
          dueDate: { 
            gte: startOfToday, 
            lte: endOfToday 
          } 
        },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      // orders due in the next 5 days (excluding today)
      prisma.order.findMany({
        where: { 
          status: 'PENDING', 
          dueDate: { 
            gt: endOfToday, 
            lte: endOf5Days 
          } 
        },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      // Orders due between 6 and 10 days from now
      prisma.order.findMany({
        where: { 
          status: 'PENDING', 
          dueDate: { 
            gt: endOf5Days, 
            lte: endOf10Days 
          } 
        },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      // ALL pending orders
      prisma.order.findMany({
        where: { status: 'PENDING' },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    return NextResponse.json({
      dueIn1Day: dueToday, // Renamed for clarity
      dueIn5Days,
      dueIn10Days,
      allPending,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}