'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // AlertDialogTrigger for better accessibility and control
} from '@/components/ui/alert-dialog'

interface OrderTableRowActionsProps {
  orderId: number;
  onDelete: () => void;
  isDeleting: boolean;
}

export function OrderTableRowActions({ orderId, onDelete, isDeleting }: OrderTableRowActionsProps) {
  
  return (
    // The AlertDialog no longer needs to be controlled by local state.
    // Using AlertDialogTrigger is the standard way.
    <AlertDialog>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${orderId}`}>View</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${orderId}/edit`}>Edit</Link>
        </Button>
        {/* The Delete button now just triggers the dialog to open. */}
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeleting}>
            Delete
          </Button>
        </AlertDialogTrigger>
      </div>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this order.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {/* action button now calls the onDelete function passed down as a prop. */}
          <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
                  