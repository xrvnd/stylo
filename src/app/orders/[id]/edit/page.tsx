'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload, ImageProp } from '@/components/ui/image-upload'
import { toast } from 'sonner'

type OrderItem = {
  id?: number;
  description: string;
  quantity: number;
  price: number;
  workType: string;
}
type Employee = { id: number; name: string }

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const orderId = parseInt(id, 10);
  
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    employeeId: '',
    notes: '',
    dueDate: '',
    advancePaid: 0,
    items: [] as OrderItem[],
  });
  const [images, setImages] = useState<ImageProp[]>([]);

  useEffect(() => {
    if (isNaN(orderId)) return;

    const fetchOrderAndEmployees = async () => {
      setLoading(true);
      try {
        const [orderRes, employeesRes] = await Promise.all([
          fetch(`/api/orders/${orderId}`),
          fetch('/api/employees'),
        ]);

        if (!orderRes.ok) throw new Error('Failed to fetch order data');
        if (!employeesRes.ok) throw new Error('Failed to fetch employees');

        const orderData = await orderRes.json();
        const employeesList = await employeesRes.json();
        
        setEmployees(employeesList);
        setFormData({
          employeeId: orderData.employeeId?.toString() || '',
          notes: orderData.notes || '',
          dueDate: orderData.dueDate ? new Date(orderData.dueDate).toISOString().split('T')[0] : '',
          advancePaid: orderData.advanceAmount || 0,
          items: orderData.orderItems.map((item: any) => ({ ...item, workType: item.workType || 'SIMPLE_WORK' })),
        });
        setImages(orderData.orderImages?.map((img: { id: number }) => ({
          id: img.id,
          url: `/api/orders/${orderId}/images/${img.id}`,
        })) || []);

      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderAndEmployees();
  }, [orderId, router]);
  
  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, price: 0, workType: 'SIMPLE_WORK' }] }));
  const removeItem = (index: number) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = formData.items.map((item, i) => {
        if (i === index) {
            return { ...item, [field]: field === 'description' || field === 'workType' ? value : Number(value) || 0 };
        }
        return item;
    });
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const { totalAmount, remainingDue } = useMemo(() => {
    const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const remaining = total - formData.advancePaid;
    return { totalAmount: total, remainingDue: remaining };
  }, [formData.items, formData.advancePaid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const formDataToSubmit = new FormData();
        const newImageFiles = images.filter(img => img.file);
        const existingImageIds = images.filter(img => img.id).map(img => img.id);

        newImageFiles.forEach(img => {
            if (img.file) formDataToSubmit.append('images', img.file);
        });
        formDataToSubmit.append('imageIds', JSON.stringify(existingImageIds));

        formDataToSubmit.append('data', JSON.stringify({
            employeeId: formData.employeeId,
            notes: formData.notes,
            dueDate: formData.dueDate,
            advancePaid: formData.advancePaid,
            items: formData.items,
        }));

        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            body: formDataToSubmit,
        });

        if (response.ok) {
            toast.success('Order updated successfully!');
            router.push(`/orders/${orderId}`);
            router.refresh();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update order');
        }
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="p-6 font-semibold text-center">Loading Order...</div>;
  if (isNaN(orderId)) return <div className="p-6 font-semibold text-center text-red-500">Invalid Order ID.</div>;

  return (
    <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Order #{id}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="employee">Employee</Label>
                            <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
                                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                                <SelectContent>{employees.map((employee) => (<SelectItem key={employee.id} value={employee.id.toString()}>{employee.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Add any notes here..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Images</Label>
                        <ImageUpload
                          images={images}
                          onImagesChange={setImages}
                          maxFiles={25}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Order Items</CardTitle>
                    <Button type="button" variant="outline" onClick={addItem}>Add Item</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formData.items.map((item, index) => (
                        <div key={item.id || index} className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-grow space-y-1"><Label>Description</Label><Input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} /></div>
                            <div className="w-full sm:w-24 space-y-1"><Label>Quantity</Label><Input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} min="1" /></div>
                            <div className="w-full sm:w-32 space-y-1"><Label>Price</Label><Input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} min="0" /></div>
                            <div className="w-full sm:w-48 space-y-1">
                                <Label>Work</Label>
                                <Select
                                    value={item.workType}
                                    onValueChange={(value) => updateItem(index, 'workType', value)}
                                >
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select work type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="SIMPLE_WORK">Simple Work</SelectItem>
                                    <SelectItem value="HAND_WORK">Hand Work</SelectItem>
                                    <SelectItem value="MACHINE_WORK">Machine Work</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="button" variant="destructive" onClick={() => removeItem(index)}>Remove</Button>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex flex-col items-end space-y-2 bg-slate-50 p-4 rounded-b-lg">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between items-center"><Label htmlFor="advancePaid">Advance Paid (₹):</Label><Input id="advancePaid" className="w-32" type="number" value={formData.advancePaid} onChange={(e) => setFormData(prev => ({ ...prev, advancePaid: Number(e.target.value) }))} /></div>
                        <div className="flex justify-between items-center text-lg font-semibold"><span>Grand Total:</span><span>₹{totalAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between items-center text-xl font-bold text-red-600"><span>Remaining Due:</span><span>₹{remainingDue.toFixed(2)}</span></div>
                    </div>
                </CardFooter>
            </Card>
            
            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
        </form>
    </div>
  )
}