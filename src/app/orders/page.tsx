// --- EDITED: Removed unused imports for Table components and date-fns, as they are now handled by OrderTable ---
import { getOrders } from '@/lib/data/orders'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { OrderTable } from './OrderTable'

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <Button asChild>
          <Link href="/orders/new">New Order</Link>
        </Button>
      </div>

      {/* --- EDITED: The static table has been replaced by our new interactive OrderTable component --- */}
      {/* The OrderTable component now contains all the logic for the search bar, filtering, and rendering the table rows. */}
      {/* We pass the full list of 'orders' to it, and it handles the rest on the client-side. */}
      <OrderTable orders={orders} />
      
      {/* --- EDITED: The original static table code has been removed from here. --- */}
      {/* 
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'PAID' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>{order.orderItems.length}</TableCell>
                <TableCell>₹{order.totalAmount}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/orders/${order.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <p className="text-sm text-gray-500">No orders found</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/orders/new">Create your first order</Link>
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div> 
      */}
    </div>
  )
}