import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/data/orders' 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { OrderDetailActions } from './OrderDetailActions'

type Props = {
  params: { id: string }
}

// The page component itself
export default async function OrderPage(props: Props) {
  const { params } = props; // get params --> Next.js best practice
  
  // fetch the specific order by its ID
  const order = await getOrderById(parseInt(params.id))

  if (!order) {
    notFound()
  }

  // helper function to format dates nicely
  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(date)

  // Helper function to format numbers as Indian Rupees
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* HEADER SECTION WITH TITLE AND ACTION BUTTONS */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.orderId || order.id}</h1>
          <p className="text-muted-foreground">
            Created: {formatDate(order.createdAt)}
          </p>
        </div>
        
        {/* action button comp.s here */}
        <OrderDetailActions order={order} />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* customer info Card */}
        <Card>
          <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Name:</span> {order.customer.name}</p>
            <p><span className="font-semibold">Phone:</span> {order.customer.phone}</p>
            <p><span className="font-semibold">Email:</span> {order.customer.email || 'N/A'}</p>
          </CardContent>
        </Card>

        {/* additional Information Card */}
        <Card>
          <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Employee:</span> {order.employee?.name || 'Unassigned'}</p>
            <p><span className="font-semibold">Due Date:</span> {order.dueDate ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(order.dueDate) : 'N/A'}</p>
            <p><span className="font-semibold">Notes:</span> {order.notes || 'None'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-center"><span>Status:</span> <Badge>{order.status}</Badge></div>
              <div className="flex justify-between"><span>Total Amount:</span> <strong>{formatCurrency(order.totalAmount)}</strong></div>
              <div className="flex justify-between"><span>Advance Paid:</span> <strong>{formatCurrency(order.advanceAmount)}</strong></div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg"><span>Remaining Due:</span> <strong className="text-red-600">{formatCurrency(order.totalAmount - order.advanceAmount)}</strong></div>
            </CardContent>
        </Card>
      </div>

      {/* Order Items Table */}
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