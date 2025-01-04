import { prisma } from '@/lib/db/prisma'

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        employee: true,
        orderItems: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
    })
    return orders
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

export async function getOrderById(id: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        employee: true,
        orderItems: true,
      },
    })
    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

export async function updateOrderStatus(id: number, status: 'PENDING' | 'PAID' | 'CANCELLED') {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })
    return order
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

export async function updateOrder(
  id: number,
  data: {
    employeeId?: number | null
    notes?: string
    dueDate?: Date | null
    orderItems: {
      id?: number
      description: string
      quantity: number
      price: number
    }[]
  }
) {
  try {
    // Start a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // If there are existing items, delete them
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      })

      // Calculate new total amount
      const totalAmount = data.orderItems.reduce(
        (sum, item) => sum + (item.quantity * item.price),
        0
      )

      // Update the order with new data
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          employeeId: data.employeeId,
          notes: data.notes,
          dueDate: data.dueDate,
          totalAmount,
          orderItems: {
            create: data.orderItems.map(item => ({
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

      return updatedOrder
    })

    return order
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

export async function deleteOrder(id: number) {
  try {
    // Delete order items first (due to foreign key constraint)
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    })
    
    // Then delete the order
    const order = await prisma.order.delete({
      where: { id },
    })
    
    return order
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

export async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return employees
  } catch (error) {
    console.error('Error fetching employees:', error)
    throw error
  }
}
