import { notFound } from 'next/navigation'
// Assume you have these helper functions and components
import { getOrderById } from '@/lib/data/orders' 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// The type definition for your props
type Props = {
  params: { id: string }
}

// THE CORRECTED FUNCTION SIGNATURE
export default async function OrderPage(props: Props) {
  const { params } = props; // Get params from the props object
  
  // Now, the rest of your code works perfectly
  const order = await getOrderById(parseInt(params.id))

  if (!order) {
    notFound()
  }

  // Helper function to format dates
  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date)

  // Helper function to format currency
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.orderId || order.id}</h1>
          <p className="text-muted-foreground">
            Created: {formatDate(order.createdAt)}
          </p>
        </div>
        {/* You can add your action buttons here */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Name:</span> {order.customer.name}</p>
            <p><span className="font-semibold">Phone:</span> {order.customer.phone}</p>
            <p><span className="font-semibold">Email:</span> {order.customer.email || 'N/A'}</p>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Employee:</span> {order.employee?.name || 'Unassigned'}</p>
            <p><span className="font-semibold">Due Date:</span> {order.dueDate ? formatDate(order.dueDate) : 'N/A'}</p>
            <p><span className="font-semibold">Notes:</span> {order.notes || 'None'}</p>
          </CardContent>
        </Card>
        
        {/* Order Details */}
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Status:</span> <Badge>{order.status}</Badge></p>
            <p className="flex justify-between"><span>Total Amount:</span> <strong>{formatCurrency(order.totalAmount)}</strong></p>
            <p className="flex justify-between"><span>Advance Paid:</span> <strong>{formatCurrency(order.advanceAmount)}</strong></p>
            <hr className="my-2" />
            <p className="flex justify-between text-lg"><span>Remaining Due:</span> <strong className="text-red-600">{formatCurrency(order.totalAmount - order.advanceAmount)}</strong></p>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell colSpan={3} className="text-right">Grand Total</TableCell>
                <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
