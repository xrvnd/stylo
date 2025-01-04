import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { getOrderById, updateOrder, deleteOrder, updateOrderStatus } from '@/lib/data/orders'

interface Params {
  params: {
    id: string
  }
}

// GET /api/orders/[id] - Get specific order
export async function GET(request: Request, { params }: Params) {
  try {
    const order = await getOrderById(parseInt(params.id))
    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return new NextResponse('Error fetching order', { status: 500 })
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json()
    const order = await updateOrder(parseInt(params.id), body)
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return new NextResponse('Error updating order', { status: 500 })
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(request: Request, { params }: Params) {
  try {
    const order = await deleteOrder(parseInt(params.id))
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error deleting order:', error)
    return new NextResponse('Error deleting order', { status: 500 })
  }
}
