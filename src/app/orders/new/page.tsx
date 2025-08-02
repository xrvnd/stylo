'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { toast } from 'sonner'

type OrderItem = {
  description: string
  price: number //removed order quantity
}

type OrderImage = {
  id?: number
  url: string
  file?: File
}

type Customer = { id: number; name: string; }
type Employee = { id: number; name: string; }

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    employeeId: '',
    notes: '',
    dueDate: '',
    // Update initial state for items and add advancePayment
    items: [{ description: '', price: 0 }] as OrderItem[],
    images: [] as OrderImage[],
    advancePayment: '',
  })

  // Fetch customers and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, employeesRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/employees')
        ])
        
        if (customersRes.ok && employeesRes.ok) {
          const [customersData, employeesData] = await Promise.all([
            customersRes.json(),
            employeesRes.json()
          ])
          setCustomers(customersData)
          setEmployees(employeesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Error loading customers and employees')
      }
    }
    fetchData()
  }, [])

  // calculate totals for display
  const { totalAmount, advanceAmount, remainingAmount } = useMemo(() => {
    const total = formData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
    const advance = Number(formData.advancePayment) || 0
    return {
      totalAmount: total,
      advanceAmount: advance,
      remainingAmount: total - advance,
    }
  }, [formData.items, formData.advancePayment])

  const addItem = () => {
    // add item without quantity
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', price: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.orderId || !formData.customerId) {
      toast.error('Please enter an Order ID and select a customer.')
      return
    }

    if (formData.items.some(item => !item.description || item.price <= 0)) {
      toast.error('Please fill in all item details with a price greater than zero.')
      return
    }

    try {
      setLoading(true)
      const formDataToSend = new FormData()

      // append all text-based form data
      formDataToSend.append('orderId', formData.orderId)
      formDataToSend.append('customerId', formData.customerId)
      formDataToSend.append('advancePayment', formData.advancePayment || '0')
      
      if (formData.employeeId) formDataToSend.append('employeeId', formData.employeeId)
      if (formData.notes) formDataToSend.append('notes', formData.notes)
      if (formData.dueDate) formDataToSend.append('dueDate', formData.dueDate)

      // adjust items to include quantity = 1 for the backend
      const itemsForBackend = formData.items.map(item => ({ ...item, quantity: 1 }))
      formDataToSend.append('orderItems', JSON.stringify(itemsForBackend))

      // append image files
      formData.images.forEach((img) => {
        if (img.file) formDataToSend.append('images', img.file)
      })

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        const order = await response.json()
        toast.success('Order created successfully!')
        router.push(`/orders/${order.id}`)
      } else {
        const data = await response.json()
        console.error('API Error:', data)
        toast.error(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">New Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* OrderId, Customer, Employee, DueDate... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input type="number" id="orderId" value={formData.orderId} onChange={e => setFormData(prev => ({ ...prev, orderId: e.target.value }))} required min={1} placeholder="Enter order number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData((prev) => ({ ...prev, customerId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                  <SelectContent>{customers.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Assign Employee</Label>
                <Select value={formData.employeeId} onValueChange={(value) => setFormData((prev) => ({ ...prev, employeeId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Optional: Select an employee" /></SelectTrigger>
                  <SelectContent>{employees.map((e) => (<SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input type="date" id="dueDate" value={formData.dueDate} onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))} />
              </div>
            </div>
            
            {/* add Advance Payment Input */}
            <div className="space-y-2">
              <Label htmlFor="advancePayment">Advance Payment (₹)</Label>
              <Input type="number" id="advancePayment" value={formData.advancePayment} onChange={e => setFormData(prev => ({...prev, advancePayment: e.target.value}))} placeholder="e.g., 500" min="0"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              {/* (7) Increase maxFiles to 25 */}
              <ImageUpload images={formData.images} onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))} maxFiles={25} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button type="button" onClick={addItem}>Add Item</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Description</Label>
                  <Input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Item description" />
                </div>
                {/* ---quantity Input is REMOVED--- */}
                <div className="w-40 space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={item.price === undefined ? '' : String(item.price)} onChange={(e) => updateItem(index, 'price', e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                </div>
                <Button type="button" variant="destructive" onClick={() => removeItem(index)} className="mb-1">Remove</Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-2 bg-slate-50 p-4 rounded-b-lg">
            {/* add summary section here...*/}
            <p className="text-lg">Total Amount: <span className="font-bold">₹{totalAmount.toFixed(2)}</span></p>
            <p className="text-md text-green-600">Advance Paid: <span className="font-semibold">₹{advanceAmount.toFixed(2)}</span></p>
            <p className="text-xl font-bold">Remaining Due: <span className="text-blue-700">₹{remainingAmount.toFixed(2)}</span></p>
          </CardFooter>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Order'}</Button>
        </div>
      </form>
    </div>
  )
}
