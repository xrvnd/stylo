import { NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/data/orders'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    const order = await updateOrderStatus(parseInt(params.id), status)
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order status:', error)
    return new NextResponse('Error updating order status', { status: 500 })
  }
}
