import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { orderSchema } from '@/lib/validations/schema'

// GET /api/orders - List all orders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.order.count()
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create order
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Calculate total from items
    const totalAmount = data.orderItems?.reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) * Number(item.price)),
      0
    ) || 0

    // Validate order data
    const orderValidation = orderSchema.safeParse({
      ...data,
      totalAmount
    })

    if (!orderValidation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: orderValidation.error.format() },
        { status: 400 }
      )
    }

    const order = await prisma.order.create({
      data: orderValidation.data,
      include: {
        customer: true,
        orderItems: true
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
