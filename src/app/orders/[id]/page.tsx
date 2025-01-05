import { getOrderById } from '@/lib/data/orders'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { notFound } from 'next/navigation'
import DeleteOrderButton from './DeleteOrderButton'
import UpdateStatusButton from './UpdateStatusButton'
import Image from 'next/image'

export default async function OrderPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await getOrderById(parseInt(params.id))

  if (!order) {
    notFound()
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-semibold text-gray-900">Order #{order.id}</h1>
          <p className="text-sm text-gray-500">
            Created {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <DeleteOrderButton orderId={order.id} />
          <UpdateStatusButton orderId={order.id} currentStatus={order.status} />
          <Button variant="outline" asChild>
            <Link href={`/orders/${order.id}/edit`}>Edit Order</Link>
          </Button>
          <Button asChild>
            <Link href={`/customers/${order.customerId}`}>View Customer</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p>{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p>{order.customer.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{order.customer.email || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Employee</p>
                <p>{order.employee?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p>
                  {order.dueDate
                    ? formatDistanceToNow(new Date(order.dueDate), {
                        addSuffix: true,
                      })
                    : 'No due date'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p>{order.notes || 'No notes'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p>{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Employee</p>
                <p>{order.employee?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p>{order.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p>
                  {order.dueDate
                    ? formatDistanceToNow(new Date(order.dueDate), {
                        addSuffix: true,
                      })
                    : 'No due date'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p>₹{order.totalAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
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
                {order.orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.price}</TableCell>
                    <TableCell className="text-right">
                      ₹{item.quantity * item.price}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{order.totalAmount}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {order.orderImages && order.orderImages.length > 0 && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Order Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {order.orderImages.map((image) => (
                  <div key={image.id} className="relative aspect-square">
                    <Image
                      src={`/api/orders/${order.id}/images/${image.id}`}
                      alt={`Order image ${image.id}`}
                      fill
                      style={{
                        objectFit: 'cover',
                        borderRadius: '10px',
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
