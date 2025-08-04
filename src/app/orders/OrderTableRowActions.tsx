'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export function OrderTableRowActions({ orderId }: { orderId: number }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAlertOpen, setAlertOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete order')
      toast.success('Order deleted successfully')
      router.refresh() // Refresh the table to show the change
    } catch (error) {
      toast.error('Could not delete the order.')
    } finally {
      setIsDeleting(false)
      setAlertOpen(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${orderId}`}>View</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${orderId}/edit`}>Edit</Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setAlertOpen(true)}
          disabled={isDeleting}
        >
          Delete
        </Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
