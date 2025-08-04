'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { OrderTableRowActions } from './OrderTableRowActions'
import { Search } from 'lucide-react'

// Define the full shape of an order object that this component expects
type Order = {
  id: number;
  orderId: number | null;
  status: string;
  totalAmount: number;
  createdAt: Date;
  customer: { name: string; };
  orderItems: any[]; // checking length
};

type OrderTableProps = {
  orders: Order[];
};

// Helper function to format currency
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

export function OrderTable({ orders }: OrderTableProps) {
  // state to hold user's search query
  const [searchTerm, setSearchTerm] = useState('');

  // useMemo will re-calculate the filtered list ONLY when the orders or searchTerm change,
  // making it verrrry efficient.
  const filteredOrders = useMemo(() => {
    // if search term is empty, return all orders immediately.
    if (!searchTerm.trim()) {
      return orders;
    }

    // filter the orders, i'm convert the orderId to a string --> to use string methods.
    return orders.filter(order =>
      order.orderId?.toString().startsWith(searchTerm.trim())
    );
  }, [orders, searchTerm]); // dependencies for memoization

  return (
    <div>
      {/* Search-Input Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/3"
          />
        </div>
      </div>

      {/* "The Orders" Table */}
      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              // mapping over filteredOrders array
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.orderId || order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'PAID' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.orderItems.length}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <OrderTableRowActions orderId={order.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found for your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}