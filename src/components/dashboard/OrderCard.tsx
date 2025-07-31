import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Order = { id: number; orderId: number | null; customer: { name: string; }; dueDate: string | null; totalAmount: number; }
type OrderCardProps = { order: Order; severity: 'critical' | 'high' | 'medium' | 'low'; }

const severityStyles = {
  critical: 'border-red-500/50 bg-red-500/5',
  high: 'border-orange-400/50 bg-orange-400/5',
  medium: 'border-yellow-400/50 bg-yellow-400/5',
  low: 'border-gray-200 bg-gray-500/5',
}

/**
 * UPDATED FUNCTION: Formats the currency to Indian Rupees (₹).
 * @param amount - The amount in the smallest currency unit (paise).
 * @returns A formatted currency string (e.g., "₹15,000.00").
 */
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount / 100);
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function OrderCard({ order, severity }: OrderCardProps) {
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
          <p className="text-lg font-semibold">{formatCurrency(order.totalAmount)}</p>
        </CardContent>
      </Card>
    </Link>
  )
}