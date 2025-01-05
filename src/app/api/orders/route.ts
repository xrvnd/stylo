import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { orderSchema } from '@/lib/validations/schema'
import { validateRequest } from '@/lib/validations/middleware'

// GET /api/orders - List all orders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Validate status if provided
    if (status && !['PENDING', 'PAID'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be either PENDING or PAID' },
        { status: 400 }
      )
    }

    const orders = await prisma.order.findMany({
      where: status ? {
        status: status
      } : undefined,
      orderBy: {
        orderDate: 'desc'
      }
    })

    // Fetch related items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await prisma.orderItem.findMany({
          where: {
            orderId: order.id
          }
        })
        const images = await prisma.orderImage.findMany({
          where: {
            orderId: order.id
          }
        })
        return {
          ...order,
          items,
          images
        }
      })
    )

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create order
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const orderData = JSON.parse(formData.get('data') as string)
    const imageFiles = formData.getAll('images') as File[]

    // Calculate total amount
    const totalAmount = orderData.orderItems.reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) * Number(item.price)),
      0
    )

    // Convert Date object to ISO string for validation
    const dueDate = orderData.dueDate ? new Date(orderData.dueDate).toISOString() : null

    // Validate order data using Zod
    const orderValidation = orderSchema.safeParse({
      ...orderData,
      customerId: Number(orderData.customerId),
      employeeId: orderData.employeeId ? Number(orderData.employeeId) : null,
      dueDate,
      totalAmount,
      status: 'PENDING'
    })

    if (!orderValidation.success) {
      return NextResponse.json(
        { error: 'Invalid order data', details: orderValidation.error.format() },
        { status: 400 }
      )
    }

    // Start a transaction to handle both order creation and images
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          customerId: orderValidation.data.customerId,
          employeeId: orderValidation.data.employeeId,
          notes: orderValidation.data.notes,
          dueDate: orderValidation.data.dueDate ? new Date(orderValidation.data.dueDate) : null,
          status: orderValidation.data.status,
          totalAmount: orderValidation.data.totalAmount,
          orderItems: {
            create: orderValidation.data.orderItems
          }
        },
        include: {
          customer: true,
          employee: true,
          orderItems: true,
          orderImages: true
        }
      })

      // Process images
      if (imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (file) => {
            const buffer = Buffer.from(await file.arrayBuffer())
            return tx.orderImage.create({
              data: {
                orderId: order.id,
                image: buffer
              }
            })
          })
        )
      }

      return order
    })

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
