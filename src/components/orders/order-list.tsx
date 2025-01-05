import { Order } from '@prisma/client'
import { useState } from 'react'

interface OrderListProps {
  orders: Array<Order & {
    customer: { name: string; phone: string }
  }>
}

export function OrderList({ orders }: OrderListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filteredOrders = orders.filter(order => 
    statusFilter === 'ALL' ? true : order.status === statusFilter
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border-gray-300"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="bg-white border-b">
                <td className="px-6 py-4">{order.customer.name}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">₹{order.totalAmount}</td>
                <td className="px-6 py-4">{order.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
