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

// POST /api/orders - Create new order
export async function POST(request: Request) {
  // Validate request data
  const validation = await validateRequest(orderSchema)(request)
  if (!validation.success) {
    return validation.error
  }

  try {
    const { items, images, ...orderData } = validation.data

    // Create order first
    const order = await prisma.order.create({
      data: orderData
    })

    // Create order items
    if (items && items.length > 0) {
      await prisma.orderItem.createMany({
        data: items.map((item) => ({
          ...item,
          orderId: order.id
        }))
      })
    }

    // Create order images
    if (images && images.length > 0) {
      await prisma.orderImage.createMany({
        data: images.map((image) => ({
          image: image,
          orderId: order.id
        }))
      })
    }

    // Fetch the complete order with items and images
    const completeOrder = await prisma.order.findUnique({
      where: {
        id: order.id
      }
    })

    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId: order.id
      }
    })

    const orderImages = await prisma.orderImage.findMany({
      where: {
        orderId: order.id
      }
    })

    return NextResponse.json({
      ...completeOrder,
      items: orderItems,
      images: orderImages
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
