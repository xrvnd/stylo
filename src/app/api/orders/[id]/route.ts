import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { orderSchema } from '@/lib/validations/schema'
import { validateId } from '@/lib/validations/middleware'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

// GET /api/orders/[id] - Get specific order
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params
  const validation = validateId(id)
  if (!validation.success) {
    return validation.error
  }

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: validation.id
      },
      include: {
        customer: true,
        employee: true,
        orderItems: true,
        orderImages: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params
  const validation = validateId(id)
  if (!validation.success) {
    return validation.error
  }

  try {
    const formData = await request.formData()
    const orderData = JSON.parse(formData.get('data') as string)
    const existingImageIds = JSON.parse(formData.get('imageIds') as string || '[]')
    const newImageFiles = formData.getAll('images') as File[]

    // Get the existing order to preserve some fields
    const existingOrder = await prisma.order.findUnique({
      where: { id: validation.id },
      select: { customerId: true, status: true }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Calculate total amount from items
    const totalAmount = orderData.items.reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) * Number(item.price)),
      0
    )

    // Prepare the order data for validation
    const orderDataForValidation = {
      customerId: existingOrder.customerId,
      status: existingOrder.status,
      employeeId: orderData.employeeId,
      notes: orderData.notes,
      dueDate: orderData.dueDate,
      totalAmount,
      orderItems: orderData.items.map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price)
      }))
    }

    console.log('Data for validation:', orderDataForValidation)

    // Validate order data using Zod
    const orderValidation = orderSchema.safeParse(orderDataForValidation)

    if (!orderValidation.success) {
      console.error('Validation error:', orderValidation.error.format())
      return NextResponse.json(
        { error: 'Invalid order data', details: orderValidation.error.format() },
        { status: 400 }
      )
    }

    // Start a transaction to handle both order update and images
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Delete removed images
      await tx.orderImage.deleteMany({
        where: {
          orderId: validation.id,
          id: { notIn: existingImageIds }
        }
      })

      // Process new images
      const newImages = await Promise.all(
        newImageFiles.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer())
          return tx.orderImage.create({
            data: {
              orderId: validation.id,
              image: buffer
            }
          })
        })
      )

      // Update order with validated data
      const order = await tx.order.update({
        where: {
          id: validation.id
        },
        data: {
          employeeId: orderValidation.data.employeeId,
          notes: orderValidation.data.notes,
          dueDate: orderValidation.data.dueDate,
          totalAmount: orderValidation.data.totalAmount,
          orderItems: {
            deleteMany: {},
            create: orderValidation.data.orderItems // Use orderItems from validated data
          }
        },
        include: {
          customer: true,
          employee: true,
          orderItems: true,
          orderImages: true
        }
      })

      return order
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params
  const validation = validateId(id)
  if (!validation.success) {
    return validation.error
  }

  try {
    await prisma.order.delete({
      where: {
        id: validation.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
