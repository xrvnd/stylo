'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
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
  id?: number
  description: string
  quantity: number
  price: number
}

type OrderImage = {
  id?: number
  url: string
  file?: File
}

type Employee = {
  id: number
  name: string
}

export default function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    employeeId: '',
    notes: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, price: 0 }] as OrderItem[],
    images: [] as OrderImage[]
  })

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const [orderResponse, employeesResponse] = await Promise.all([
          fetch(`/api/orders/${id}`),
          fetch('/api/employees')
        ])

        if (!orderResponse.ok || !employeesResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const order = await orderResponse.json()
        const employeesList = await employeesResponse.json()

        setEmployees(employeesList)
        setFormData({
          employeeId: order.employeeId?.toString() || '',
          notes: order.notes || '',
          dueDate: order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
          items: order.orderItems,
          images: order.orderImages?.map((img: any) => ({
            id: img.id,
            url: `/api/orders/${id}/images/${img.id}`
          })) || []
        })
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Error loading order data')
        router.push('/orders')
      }
    }

    fetchOrder()
  }, [id, router])

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }]
    }))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'description' ? value : Number(value)
    }
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.price), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.items.some(item => !item.description || item.quantity <= 0 || item.price <= 0)) {
      toast.error('Please fill in all item details')
      return
    }

    try {
      setLoading(true)

      // First, upload any new images
      const formDataWithImages = new FormData()
      const newImages = formData.images.filter(img => img.file)
      
      // Add existing image IDs to keep
      const existingImageIds = formData.images
        .filter(img => img.id)
        .map(img => img.id)
      
      formDataWithImages.append('imageIds', JSON.stringify(existingImageIds))
      
      // Add new image files
      newImages.forEach((img, index) => {
        if (img.file) {
          formDataWithImages.append(`images`, img.file)
        }
      })

      // Add order data
      formDataWithImages.append('data', JSON.stringify({
        employeeId: formData.employeeId ? parseInt(formData.employeeId) : null,
        notes: formData.notes,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      }))

      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        body: formDataWithImages
      })

      if (response.ok) {
        toast.success('Order updated successfully')
        router.push(`/orders/${id}`)
      } else {
        const formData = await response.formData();
        const dataString = formData.get('data');
        if (typeof dataString !== 'string') {
          return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
        }
        const data = JSON.parse(dataString);
        throw new Error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error, JSON.stringify(error));
      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      );
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Order #{id}</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select 
                    value={formData.employeeId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes here..."
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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-6">
                    <Label htmlFor={`item-${index}-desc`}>Description</Label>
                    <Input
                      id={`item-${index}-desc`}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-${index}-qty`}>Quantity</Label>
                    <Input
                      id={`item-${index}-qty`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-${index}-price`}>Price</Label>
                    <Input
                      id={`item-${index}-price`}
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeItem(index)}
                      className="w-full"
                      disabled={formData.items.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem}>
                Add Item
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-lg font-semibold">
                Total: ₹{calculateTotal()}
              </div>
            </CardFooter>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
