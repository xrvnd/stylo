import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// UPDATED TYPE DEFINITION
type Order = {
  id: number;
  orderId: number | null;
  customer: { name: string; };
  dueDate: string | null;
  totalAmount: number;
  advanceAmount: number;
}

type OrderCardProps = { order: Order; severity: 'critical' | 'high' | 'medium' | 'low'; }

const severityStyles = {
  critical: 'border-red-500/50 bg-red-500/5',
  high: 'border-orange-400/50 bg-orange-400/5',
  medium: 'border-yellow-400/50 bg-yellow-400/5',
  low: 'border-gray-200 bg-gray-500/5',
}

function formatCurrency(amount: number) {
  // Dividing by 100 if your amount is stored in paise/cents
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount); 
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function OrderCard({ order, severity }: OrderCardProps) {
  // Calculate remaining due right here for clean access
  const remainingDue = order.totalAmount - order.advanceAmount;

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className={cn('transition-all hover:shadow-md', severityStyles[severity])}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Order #{order.orderId || order.id}</CardTitle>
            <Badge variant="outline">{order.customer.name}</Badge>
          </div>
          <CardDescription>
            Due: {formatDate(order.dueDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* UPDATED DISPLAY LOGIC */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="font-medium">Advance Paid:</span>
              <span className="font-semibold">{formatCurrency(order.advanceAmount)}</span>
            </div>
            <hr className="my-2 border-dashed" />
            <div className="flex justify-between text-base font-bold">
              <span>Remaining Due:</span>
              <span>{formatCurrency(remainingDue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}