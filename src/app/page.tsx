'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderCard } from '@/components/dashboard/OrderCard'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

type ApiOrder = { id: number; orderId: number | null; customer: { name: string; }; dueDate: string | null; totalAmount: number; }
type DashboardData = { dueIn1Day: ApiOrder[]; dueIn5Days: ApiOrder[]; dueIn10Days: ApiOrder[]; allPending: ApiOrder[]; }

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
    <p className="text-muted-foreground">{message}</p>
  </div>
)

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    ))}
  </div>
)

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/dashboard/orders')
        if (!response.ok) throw new Error('Failed to fetch dashboard data')
        const result: DashboardData = await response.json()
        setData(result)
      } catch (error) {
        console.error(error)
        toast.error('Could not load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderOrderList = (orders: ApiOrder[], severity: 'critical' | 'high' | 'medium' | 'low') => {
    if (!orders || orders.length === 0) {
      return <EmptyState message="No orders in this category." />
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} severity={severity} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold">Orders Dashboard</h1>
      <Tabs defaultValue="all_pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="due_1_day">
            Due Today ({loading ? '...' : data?.dueIn1Day.length})
            <span className="ml-2 h-2 w-2 rounded-full bg-red-500"></span>
          </TabsTrigger>
          <TabsTrigger value="due_5_days">
            Due in 5 Days ({loading ? '...' : data?.dueIn5Days.length})
            <span className="ml-2 h-2 w-2 rounded-full bg-orange-500"></span>
          </TabsTrigger>
          <TabsTrigger value="due_10_days">
            Due in 10 Days ({loading ? '...' : data?.dueIn10Days.length})
            <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
          </TabsTrigger>
          <TabsTrigger value="all_pending">
            All Pending ({loading ? '...' : data?.allPending.length})
          </TabsTrigger>
        </TabsList>
        {loading ? (
          <div className="pt-8"> <LoadingSkeleton /> </div>
        ) : (
          <>
            <TabsContent value="due_1_day" className="pt-4">{renderOrderList(data?.dueIn1Day || [], 'critical')}</TabsContent>
            <TabsContent value="due_5_days" className="pt-4">{renderOrderList(data?.dueIn5Days || [], 'high')}</TabsContent>
            <TabsContent value="due_10_days" className="pt-4">{renderOrderList(data?.dueIn10Days || [], 'medium')}</TabsContent>
            <TabsContent value="all_pending" className="pt-4">{renderOrderList(data?.allPending || [], 'low')}</TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
