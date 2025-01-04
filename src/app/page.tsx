import { getDashboardData } from '@/lib/data/dashboard'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const { totalOrders, totalCustomers, totalEmployees, recentOrders } = await getDashboardData()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Button asChild>
          <Link href="/orders/new">New Order</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Orders Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-lg font-semibold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="link" asChild>
              <Link href="/orders">View all orders</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Customers Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-lg font-semibold text-gray-900">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="link" asChild>
              <Link href="/customers">View all customers</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Employees Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-lg font-semibold text-gray-900">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="link" asChild>
              <Link href="/employees">View all employees</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/orders/new">Create Order</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {order.status}
                        </p>
                        <p className="text-sm text-gray-500">
                          Items: {order.orderItems.length}
                        </p>
                      </div>
                      <div>
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-4">No orders yet</p>
              <Button asChild>
                <Link href="/orders/new">Create your first order</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
