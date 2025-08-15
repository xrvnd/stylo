'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'
import { OrderTableRowActions } from './OrderTableRowActions'
import { Search } from 'lucide-react'

// type needs to be updated to match the new, efficient query from getOrders
type Order = {
  id: number;
  orderId: number | null;
  status: 'PENDING' | 'PAID';
  totalAmount: number;
  createdAt: string | Date;
  paymentMethod: string | null;
  customer: { name: string; };
  _count: { orderItems: number; }; // We use _count now
};

type OrderTableProps = {
  orders: Order[];
};

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

export function OrderTable({ orders: initialOrders }: OrderTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [paymentMethods, setPaymentMethods] = useState<Record<number, string>>({});
  const [loadingRows, setLoadingRows] = useState<Record<number, boolean>>({});

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    return orders.filter(order =>
      order.orderId?.toString().startsWith(searchTerm.trim())
    );
  }, [orders, searchTerm]);

  const handleMarkAsPaid = async (orderId: number) => {
    const paymentMethod = paymentMethods[orderId];
    if (!paymentMethod) {
      toast.error("Please select a payment method first.");
      return;
    }
    setLoadingRows(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch(`/api/orders/${orderId}/mark-as-paid`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order.");
      }
      setOrders(currentOrders =>
        currentOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'PAID', paymentMethod: paymentMethod }
            : order
        )
      );
      toast.success(`Order #${orderId} marked as PAID.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoadingRows(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // delete logic now lives in the parent component ---
  const handleDeleteOrder = async (orderId: number) => {
    setLoadingRows(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete order');
      
      // OPTIMISTIC UI UPDATE --> deletion
      setOrders(currentOrders => currentOrders.filter(order => order.id !== orderId));
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error('Could not delete the order.');
    } finally {
      setLoadingRows(prev => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <div>
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
              <TableHead className="text-center">Mark as Paid</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.orderId || order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'PAID' ? 'success' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  {/* --- MODIFICATION: Use the new _count property --- */}
                  <TableCell>{order._count.orderItems}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell className="text-center w-[280px]">
                    {order.status === 'PENDING' ? (
                      <div className="flex items-center justify-center gap-2">
                        <Select
                          onValueChange={(value) => setPaymentMethods(prev => ({ ...prev, [order.id]: value }))}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Payment Method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CARD">Card</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={!paymentMethods[order.id] || loadingRows[order.id]}
                          onClick={() => handleMarkAsPaid(order.id)}
                        >
                          {loadingRows[order.id] ? "..." : "Paid"}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground font-medium">
                        Paid via {order.paymentMethod}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <OrderTableRowActions
                      orderId={order.id}
                      onDelete={() => handleDeleteOrder(order.id)}
                      isDeleting={!!loadingRows[order.id]}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}