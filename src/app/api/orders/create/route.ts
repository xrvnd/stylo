import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, employeeId, orderItems, notes, dueDate } = body

    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (sum: number, item: { quantity: number; price: number }) => 
        sum + (item.quantity * item.price), 
      0
    )

    // Create the order and its items in a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create the order
      const order = await prisma.order.create({
        data: {
          customerId,
          employeeId,
          totalAmount,
          notes,
          dueDate: dueDate ? new Date(dueDate) : null,
          orderItems: {
            create: orderItems.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          customer: true,
          employee: true,
          orderItems: true,
        },
      })

      return order
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    )
  }
}
