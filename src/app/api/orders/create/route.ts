import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const dataString = formData.get('data');
    if (typeof dataString !== 'string') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    const data = JSON.parse(dataString);
    const { orderId, customerId, employeeId, orderItems, notes, dueDate } = data;

    // Input validation
    if (
      typeof orderId !== 'number' ||
      isNaN(orderId) ||
      orderId < 1 ||
      typeof customerId !== 'number' ||
      isNaN(customerId) ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

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
          orderId, // <-- store orderId
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
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
