import { prisma } from '@/lib/db/prisma'

// ✅ Get all orders (latest first)
export async function getOrders() {
  try {
    return await prisma.order.findMany({
      include: {
        customer: true,
        employee: true,
        orderItems: true,
        orderImages: true, // images included
      },
      orderBy: {
        orderDate: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// ✅ Get single order by ID
export async function getOrderById(id: number) {
  try {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        employee: true,
        orderItems: true,
        orderImages: true, // includes image bytes
      },
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

// ✅ Update only order status
export async function updateOrderStatus(
  id: number,
  status: 'PENDING' | 'PAID' | 'CANCELLED'
) {
  try {
    return await prisma.order.update({
      where: { id },
      data: { status },
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

// ✅ Update an order & its items
export async function updateOrder(
  id: number,
  data: {
    employeeId?: number | null
    notes?: string
    dueDate?: Date | null | string
    orderItems: {
      id?: number
      description: string
      quantity: number
      price: number
    }[]
    advanceAmount?: number // ✅ renamed to match schema
  }
) {
  try {
    const order = await prisma.$transaction(async (prisma) => {
      // Remove old items
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      })

      // Recalculate total
      const totalAmount = data.orderItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      )

      // Update order
      return await prisma.order.update({
        where: { id },
        data: {
          employeeId: data.employeeId ?? null,
          notes: data.notes,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          totalAmount,
          advanceAmount: data.advanceAmount ?? 0,
          orderItems: {
            create: data.orderItems.map((item) => ({
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
          orderImages: true,
        },
      })
    })

    return order
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

// ✅ Delete an order (and its items)
export async function deleteOrder(id: number) {
  try {
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    })

    return await prisma.order.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}

// ✅ Fetch customers
export async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

// ✅ Fetch employees
export async function getEmployees() {
  try {
    return await prisma.employee.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    throw error
  }
}
