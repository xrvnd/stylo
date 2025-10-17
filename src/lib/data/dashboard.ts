import { prisma } from '@/lib/db/prisma'

export async function getDashboardData() {
  try {
    const [totalOrders, totalCustomers, totalEmployees, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.employee.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          orderDate: 'desc'
        },
        include: {
          orderItems: true,
          customer: true
        }
      })
    ])

    return {
      totalOrders,
      totalCustomers,
      totalEmployees,
      recentOrders
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error instanceof Error ? error.message : String(error))
    // Return default values if database is empty or there's an error
    return {
      totalOrders: 0,
      totalCustomers: 0,
      totalEmployees: 0,
      recentOrders: []
    }
  }
}
