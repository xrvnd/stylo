import { prisma } from '@/lib/db/prisma'

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

export function getCustomerById(id: number) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          orderItems: true
        },
        orderBy: {
          orderDate: 'desc'
        }
      }
    }
  }).catch(error => {
    console.error('Error fetching customer:', error)
    throw error
  })
}
