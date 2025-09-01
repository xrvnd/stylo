'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload, ImageProp } from '@/components/ui/image-upload'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type OrderItem = {
  description: string;
  quantity: number;
  price: string | number;
  workType: string;
  itemNotes: string;
  itemStatus: boolean;
}
type Customer = { id: number; name: string; phone?: string }
type Employee = { id: number; name: string }

function NewOrderPageComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()

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
    items: [{ description: '', quantity: 1, price: '', workType: 'SIMPLE_WORK', itemNotes: '', itemStatus: false }] as OrderItem[],
    advancePayment: '',
  })

  const [images, setImages] = useState<ImageProp[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersRes, employeesRes] = await Promise.all([ fetch('/api/customers'), fetch('/api/employees') ]);
        if (!customersRes.ok || !employeesRes.ok) throw new Error('Failed to fetch customers or employees');
        const customersData = await customersRes.json();
        const employeesData = await employeesRes.json();
        setCustomers(customersData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error loading customers and employees', error);
        toast.error('Error loading customers and employees');
      } finally {
        setLoading(false);
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const customerIdFromUrl = searchParams.get('customerId');
    if (customerIdFromUrl && customers.length > 0) {
      const preselectedCustomer = customers.find(c => c.id.toString() === customerIdFromUrl);
      if (preselectedCustomer) {
        setFormData(prev => ({ ...prev, customerId: preselectedCustomer.id.toString(), customerName: preselectedCustomer.name, customerPhone: preselectedCustomer.phone || '' }));
        router.replace('/orders/new', { scroll: false });
      }
    }
  }, [customers, searchParams, router]);

  const { totalAmount, advanceAmount, remainingAmount } = useMemo(() => {
    const total = formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)
    const advance = Number(formData.advancePayment) || 0
    return { totalAmount: total, advanceAmount: advance, remainingAmount: total - advance }
  }, [formData.items, formData.advancePayment])

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, price: '', workType: 'SIMPLE_WORK', itemNotes: '', itemStatus: false }] }))
  const removeItem = (index: number) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  const updateItem = (index: number, field: keyof OrderItem, value: any) => setFormData(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.orderId) { toast.error('Please enter an Order ID.'); return }
    if (!formData.customerId) { toast.error('Please select a customer.'); return }
    if (formData.items.some(item => !item.description || Number(item.price) <= 0)) { toast.error('Please fill in all item details with a price greater than zero.'); return }
    setLoading(true)

    try {
      const orderData = {
        orderId: formData.orderId,
        customerId: formData.customerId,
        employeeId: formData.employeeId,
        notes: formData.notes,
        dueDate: formData.dueDate,
        advancePayment: formData.advancePayment || '0',
        orderItems: formData.items.map(item => ({
          description: item.description,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          workType: item.workType,
          itemNotes: item.itemNotes,
          itemStatus: item.itemStatus ? "DONE" : "NOT_DONE",
        })),
      };

      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(orderData));
      images.forEach(imageProp => { if (imageProp.file) { formDataToSend.append('images', imageProp.file); } });
      const response = await fetch('/api/orders/create', { method: 'POST', body: formDataToSend });

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
              <div className="space-y-2"><Label htmlFor="orderId">Order ID</Label><Input type="number" id="orderId" value={formData.orderId} onChange={e => setFormData(prev => ({ ...prev, orderId: e.target.value }))} required min={1} placeholder="Enter order number" /></div>
              <div className="space-y-2"><Label>Customer</Label><Popover open={comboboxOpen} onOpenChange={setComboboxOpen}><PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between">{formData.customerName ? (<span className="truncate">{formData.customerName}{formData.customerPhone ? ` (${formData.customerPhone})` : ''}</span>) : ("Select a customer...")}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search customer by name..." /><CommandEmpty>No customer found.</CommandEmpty><CommandGroup>{customers.map((customer) => (<CommandItem key={customer.id} value={customer.id.toString()} onSelect={(currentValue) => { const selectedCustomer = customers.find(c => c.id.toString() === currentValue); if (selectedCustomer) { setFormData(prev => ({ ...prev, customerName: selectedCustomer.name, customerId: selectedCustomer.id.toString(), customerPhone: selectedCustomer.phone || '' })); } setComboboxOpen(false); }}><Check className={cn("mr-2 h-4 w-4", formData.customerId === customer.id.toString() ? "opacity-100" : "opacity-0")} /><div className="flex flex-col"><span className="text-sm">{customer.name}</span><span className="text-xs text-muted-foreground">{customer.phone}</span></div></CommandItem>))}</CommandGroup></Command></PopoverContent></Popover></div>
              <div className="space-y-2"><Label htmlFor="employeeId">Assign Employee</Label><Select value={formData.employeeId} onValueChange={(value) => { const newEmployeeId = value === "unassign" ? "" : value; setFormData(prev => ({ ...prev, employeeId: newEmployeeId })); }}><SelectTrigger><SelectValue placeholder="Optional: Select an employee" /></SelectTrigger><SelectContent><SelectItem value="unassign"><span className="text-muted-foreground">-- No Employee --</span></SelectItem>{employees.map((e) => (<SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="dueDate">Due Date</Label><Input type="date" id="dueDate" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="advancePayment">Advance Payment (₹)</Label><Input id="advancePayment" type="number" value={formData.advancePayment} onChange={e => setFormData(prev => ({ ...prev, advancePayment: e.target.value }))} placeholder="e.g., 500" min="0" /></div>
            <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} /></div>
            <div className="space-y-2"><Label>Images</Label><ImageUpload images={images} onImagesChange={setImages} maxFiles={25} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Order Items</CardTitle><Button type="button" onClick={addItem}>Add Item</Button></CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-grow space-y-1"><Label>Description</Label><Input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} required /></div>
                    <div className="w-full sm:w-24 space-y-1"><Label>Quantity</Label><Input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} min="1" required/></div>
                    <div className="w-full sm:w-32 space-y-1"><Label>Price</Label><Input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} min="0" required/></div>
                    <div className="w-full sm:w-48 space-y-1"><Label>Work</Label><Select value={item.workType} onValueChange={(value) => updateItem(index, 'workType', value)}><SelectTrigger><SelectValue placeholder="Select work type" /></SelectTrigger><SelectContent><SelectItem value="SIMPLE_WORK">Simple Work</SelectItem><SelectItem value="HAND_WORK">Hand Work</SelectItem><SelectItem value="MACHINE_WORK">Machine Work</SelectItem></SelectContent></Select></div>
                </div>
                <div className="flex items-end gap-4">
                    <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-center">
                            <Label>Item Notes</Label>
                            <div className="flex items-center space-x-2"><Switch id={`itemStatus-${index}`} checked={item.itemStatus} onCheckedChange={(checked) => updateItem(index, 'itemStatus', checked)} /><Label htmlFor={`itemStatus-${index}`}>{item.itemStatus ? "Done" : "Not Done"}</Label></div>
                        </div>
                        <Textarea value={item.itemNotes} onChange={(e) => updateItem(index, 'itemNotes', e.target.value)} placeholder="Add specific notes for this item..." rows={2}/>
                    </div>
                    <Button type="button" variant="destructive" onClick={() => removeItem(index)}>Remove</Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-2 bg-slate-50 p-4 rounded-b-lg">
            <p className="text-lg">Total Amount: <span className="font-bold">₹{totalAmount.toFixed(2)}</span></p>
            <p className="text-md text-green-600">Advance Paid: <span className="font-semibold">₹{advanceAmount.toFixed(2)}</span></p>
            <p className="text-xl font-bold">Remaining Due: <span className="text-red-600">{remainingAmount.toFixed(2)}</span></p>
          </CardFooter>
        </Card>
        <div className="flex justify-end space-x-4"><Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Order'}</Button></div>
      </form>
    </div>
  )
}

export default function NewOrderPage() {
  return (<Suspense fallback={<div>Loading...</div>}><NewOrderPageComponent /></Suspense>)
}
