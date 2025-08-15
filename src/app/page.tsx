'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' // Import Card components
import { OrderCard } from '@/components/dashboard/OrderCard'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

type ApiOrder = { id: number; orderId: number | null; customer: { name: string; }; dueDate: string | null; totalAmount: number; }
type OrdersDashboardData = { dueIn1Day: ApiOrder[]; dueIn5Days: ApiOrder[]; dueIn10Days: ApiOrder[]; allPending: ApiOrder[]; }

type EmployeePaymentData = { id: number; name: string; totalPaid: number; }

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
  const [ordersData, setOrdersData] = useState<OrdersDashboardData | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [employeeData, setEmployeeData] = useState<EmployeePaymentData[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true)
      try {
        const response = await fetch('/api/dashboard/orders')
        if (!response.ok) throw new Error('Failed to fetch orders data')
        const result: OrdersDashboardData = await response.json()
        setOrdersData(result)
      } catch (error) {
        toast.error('Could not load orders dashboard.')
      } finally {
        setOrdersLoading(false)
      }
    }

    const fetchEmployees = async () => {
      setEmployeesLoading(true)
      try {
        const response = await fetch('/api/dashboard/employees')
        if (!response.ok) throw new Error('Failed to fetch employee payment data')
        const result: EmployeePaymentData[] = await response.json()
        setEmployeeData(result)
      } catch (error) {
        toast.error('Could not load employee payment data.')
      } finally {
        setEmployeesLoading(false)
      }
    }

    fetchOrders()
    fetchEmployees()
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

  const renderEmployeePayments = () => {
    if (employeesLoading) return <LoadingSkeleton />;
    if (employeeData.length === 0) return <EmptyState message="No employee payments recorded." />;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {employeeData.map(emp => (
          <Card key={emp.id}>
            <CardHeader>
              <CardTitle className="text-lg">{emp.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Total Cash Paid</p>
              <p className="text-2xl font-bold">₹{emp.totalPaid.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }


  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="employee_payments">Employee Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Tabs defaultValue="all_pending" className="w-full pt-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="due_1_day">
                Due Today ({ordersLoading ? '...' : ordersData?.dueIn1Day.length})
                <span className="ml-2 h-2 w-2 rounded-full bg-red-500"></span>
              </TabsTrigger>
              <TabsTrigger value="due_5_days">
                Due in 5 Days ({ordersLoading ? '...' : ordersData?.dueIn5Days.length})
                <span className="ml-2 h-2 w-2 rounded-full bg-orange-500"></span>
              </TabsTrigger>
              <TabsTrigger value="due_10_days">
                Due in 10 Days ({ordersLoading ? '...' : ordersData?.dueIn10Days.length})
                <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
              </TabsTrigger>
              <TabsTrigger value="all_pending">
                All Pending ({ordersLoading ? '...' : ordersData?.allPending.length})
              </TabsTrigger>
            </TabsList>
            {ordersLoading ? (
              <div className="pt-8"> <LoadingSkeleton /> </div>
            ) : (
              <>
                <TabsContent value="due_1_day" className="pt-4">{renderOrderList(ordersData?.dueIn1Day || [], 'critical')}</TabsContent>
                <TabsContent value="due_5_days" className="pt-4">{renderOrderList(ordersData?.dueIn5Days || [], 'high')}</TabsContent>
                <TabsContent value="due_10_days" className="pt-4">{renderOrderList(ordersData?.dueIn10Days || [], 'medium')}</TabsContent>
                <TabsContent value="all_pending" className="pt-4">{renderOrderList(ordersData?.allPending || [], 'low')}</TabsContent>
              </>
            )}
          </Tabs>
        </TabsContent>
        <TabsContent value="employee_payments" className="pt-8">
          {renderEmployeePayments()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
