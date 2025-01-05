'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { toast } from 'sonner'

type OrderItem = {
  description: string
  quantity: number
  price: number
}

type OrderImage = {
  id?: number
  url: string
  file?: File
}

type Customer = {
  id: number
  name: string
}

type Employee = {
  id: number
  name: string
}

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    customerId: '',
    employeeId: '',
    notes: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, price: 0 }] as OrderItem[],
    images: [] as OrderImage[]
  })

  useEffect(() => {
    // Fetch customers and employees
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

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }]
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

    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }

    if (formData.items.some(item => !item.description || item.quantity <= 0 || item.price <= 0)) {
      toast.error('Please fill in all item details')
      return
    }

    try {
      setLoading(true)

      const formDataWithImages = new FormData()
      
      // Add new image files
      formData.images.forEach((img) => {
        if (img.file) {
          formDataWithImages.append('images', img.file)
        }
      })

      // Add order data
      formDataWithImages.append('data', JSON.stringify({
        customerId: parseInt(formData.customerId),
        employeeId: formData.employeeId ? parseInt(formData.employeeId) : null,
        notes: formData.notes || null,
        dueDate: formData.dueDate || null,
        orderItems: formData.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formDataWithImages
      })

      if (response.ok) {
        const order = await response.json()
        toast.success('Order created successfully')
        router.push(`/orders/${order.id}`)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(error.message || 'Error creating order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">New Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, customerId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, employeeId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxFiles={5}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Order Items</CardTitle>
            <Button type="button" onClick={addItem}>
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, 'description', e.target.value)
                    }
                    placeholder="Item description"
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, 'quantity', parseInt(e.target.value))
                    }
                    min={1}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(index, 'price', parseInt(e.target.value))
                    }
                    min={0}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeItem(index)}
                  className="mb-2"
                >
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
