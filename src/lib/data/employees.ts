import { prisma } from '@/lib/db/prisma'

export function getEmployees() {
  return prisma.employee.findMany({
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
  }).catch(error => {
    console.error('Error fetching employees:', error)
    throw error
  })
}

export function getEmployeeById(id: number) {
  return prisma.employee.findUnique({
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
    console.error('Error fetching employee:', error)
    throw error
  })
}
