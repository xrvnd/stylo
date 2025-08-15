import { prisma } from '@/lib/db/prisma'

export async function getOrders() {
  try {
    return await prisma.order.findMany({
      // only select the data that the OrderTable component actually needs.
      select: {
        id: true,
        orderId: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        paymentMethod: true, 
        customer: {
          select: {
            name: true, // Only need the customer's name
          },
        },
        _count: { // A more efficient way to get the number of items
          select: { orderItems: true }
        }
      },
      orderBy: {
        createdAt: 'desc', // It's better to order by creation date
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// get single order by ID
export async function getOrderById(id: number) {
  try {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        employee: true,
        orderItems: true,
        orderImages: true,
      },
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}



// update only order status
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

// update an order & its items
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
    advanceAmount?: number
  }
) {
  try {
    const order = await prisma.$transaction(async (prisma) => {
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      })
      const totalAmount = data.orderItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      )
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

// delete an order (and its items)
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

// FETCH customers
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

// FETCH employees
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