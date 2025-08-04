'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DeleteOrderButton from './DeleteOrderButton'
import UpdateStatusButton from './UpdateStatusButton'

// defining the shape of order prop
type OrderForActions = {
  id: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
}

type OrderDetailActionsProps = {
  order: OrderForActions;
}

// component for clean, interactive container for my buttons
export function OrderDetailActions({ order }: OrderDetailActionsProps) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2">
      {/* Update-status Button */}
      <UpdateStatusButton 
        orderId={order.id} 
        currentStatus={order.status} 
      />
      
      {/* edit Order Button */}
      <Button asChild variant="outline">
        <Link href={`/orders/${order.id}/edit`}>Edit Order</Link>
      </Button>

      {/* delete Order Button */}
      <DeleteOrderButton orderId={order.id} />
    </div>
  )
}