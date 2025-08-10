'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// Import the component AND the type we created for it
import { ImageUpload, ImageProp } from '@/components/ui/image-upload'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type OrderItem = { description: string; price: number }
type Customer = { id: number; name: string; phone?: string }
type Employee = { id: number; name: string }

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    customerName: '',
    customerPhone: '',
    employeeId: '',
    notes: '',
    dueDate: '',
    items: [{ description: '', price: 0 }] as OrderItem[],
    advancePayment: '',
  })

  // Use the correct state type for images
  const [images, setImages] = useState<ImageProp[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, employeesRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/employees'),
        ])
        if (!customersRes.ok || !employeesRes.ok) {
          throw new Error('Failed to fetch customers or employees')
        }
        const customersData = await customersRes.json()
        const employeesData = await employeesRes.json()
        setCustomers(customersData)
        setEmployees(employeesData)
      } catch (error) {
        console.error('Error loading customers and employees', error)
        toast.error('Error loading customers and employees')
      }
    }
    fetchData()
  }, [])

  const { totalAmount, advanceAmount, remainingAmount } = useMemo(() => {
    const total = formData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
    const advance = Number(formData.advancePayment) || 0
    return { totalAmount: total, advanceAmount: advance, remainingAmount: total - advance }
  }, [formData.items, formData.advancePayment])

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', price: 0 }] }))
  const removeItem = (index: number) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  const updateItem = (index: number, field: keyof OrderItem, value: string | number) =>
    setFormData(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.orderId) { toast.error('Please enter an Order ID.'); return }
    if (!formData.customerId) { toast.error('Please select a customer.'); return }
    if (formData.items.some(item => !item.description || item.price <= 0)) {
      toast.error('Please fill in all item details with a price greater than zero.')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        orderId: formData.orderId,
        customerId: formData.customerId,
        employeeId: formData.employeeId,
        notes: formData.notes,
        dueDate: formData.dueDate,
        advanceAmount: formData.advancePayment || '0',
        orderItems: formData.items.map(item => ({ ...item, quantity: 1 })),
      };

      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(orderData));

      images.forEach(imageProp => {
        if (imageProp.file) {
          formDataToSend.append('images', imageProp.file);
        }
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const order = await response.json();
        toast.success('Order created successfully!');
        router.push(`/orders/${order.id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create order. Please check the details.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold">New Order</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  type="number"
                  id="orderId"
                  value={formData.orderId}
                  onChange={e => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                  required min={1}
                  placeholder="Enter order number"
                />
              </div>

              <div className="space-y-2">
                <Label>Customer</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between">
                      {formData.customerName ? (
                        <span className="truncate">{formData.customerName}{formData.customerPhone ? ` (${formData.customerPhone})` : ''}</span>
                      ) : (
                        "Select a customer..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search customer by name..."
                      />
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.id.toString()}
                            onSelect={(currentValue) => {
                              const selectedCustomer = customers.find(c => c.id.toString() === currentValue);
                              if (selectedCustomer) {
                                setFormData(prev => ({
                                  ...prev,
                                  customerName: selectedCustomer.name,
                                  customerId: selectedCustomer.id.toString(),
                                  customerPhone: selectedCustomer.phone || ''
                                }));
                              }
                              setComboboxOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.customerId === customer.id.toString() ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                              <span className="text-sm">{customer.name}</span>
                              <span className="text-xs text-muted-foreground">{customer.phone}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Assign Employee</Label>
                <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Optional: Select an employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (<SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input type="date" id="dueDate" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advancePayment">Advance Payment (₹)</Label>
              <Input id="advancePayment" type="number" value={formData.advancePayment} onChange={e => setFormData(prev => ({ ...prev, advancePayment: e.target.value }))} placeholder="e.g., 500" min="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                // --- Updated Value ---
                maxFiles={25}
              />
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
                  <Input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Item description" required />
                </div>
                <div className="w-40 space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', Number(e.target.value))} min="0.01" step="0.01" required />
                </div>
                <Button type="button" variant="destructive" onClick={() => removeItem(index)} className="mb-1">Remove</Button>
              </div>
            ))}
          </CardContent>

          <CardFooter className="flex flex-col items-end space-y-2 bg-slate-50 p-4 rounded-b-lg">
            <p className="text-lg">Total Amount: <span className="font-bold">₹{totalAmount.toFixed(2)}</span></p>
            <p className="text-md text-green-600">Advance Paid: <span className="font-semibold">₹{advanceAmount.toFixed(2)}</span></p>
            <p className="text-xl font-bold">Remaining Due: <span className="text-blue-700">{remainingAmount.toFixed(2)}</span></p>
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