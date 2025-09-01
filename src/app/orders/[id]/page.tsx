import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getOrderById } from "@/lib/data/orders" // Assuming this function exists and fetches the order with its items
import { ImageViewer } from "./ImageViewer" // Assuming this component exists
import { Badge } from "@/components/ui/badge"

const formatWorkType = (workType: string | null) => {
  if (!workType) return "Simple Work";
  return workType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();
  
  // This function should fetch the order and include related orderItems
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const totalAmount = order.totalAmount ?? 0;
  const advanceAmount = order.advanceAmount ?? 0;
  const remainingDue = totalAmount - advanceAmount;

  const images = order.orderImages?.map((img: { image: Buffer | null }) => {
    if (!img.image) return null;
    const base64 = Buffer.from(img.image).toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  }).filter(Boolean) || [];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {order.customer?.name}</p>
            <p><strong>Phone:</strong> {order.customer?.phone}</p>
            <p><strong>Email:</strong> {order.customer?.email || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
          <CardContent>
            <p><strong>Employee:</strong> {order.employee?.name || "N/A"}</p>
            <p><strong>Due Date:</strong> {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "N/A"}</p>
            <p className="pt-2"><strong>Notes:</strong> {order.notes || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
            <p><strong>Advance Paid:</strong> ₹{advanceAmount.toLocaleString()}</p>
            <p><strong>Remaining Due:</strong> ₹{remainingDue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {order.orderItems?.map((item, idx) => (
            <div key={item.id || idx} className="py-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <div className="md:col-span-3">
                <p className="font-semibold text-sm">{item.description}</p>
                {item.itemNotes && (
                  <p className="text-xs text-muted-foreground mt-1 pl-2 border-l-2">{item.itemNotes}</p>
                )}
              </div>
              <div className="text-sm self-center">
                <Badge variant="outline">{formatWorkType(item.workType)}</Badge>
              </div>
              <div className="text-sm self-center">
                <p>Qty: {item.quantity}</p>
                <p>Price: ₹{item.price.toLocaleString()}</p>
              </div>
              <div className="text-sm self-center justify-self-start md:justify-self-end">
                <Badge className={item.itemStatus === 'DONE' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                  {item.itemStatus === 'DONE' ? 'Done' : 'Not Done'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {images.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Uploaded Images</CardTitle></CardHeader>
          <CardContent><ImageViewer images={images} /></CardContent>
        </Card>
      )}
    </div>
  );
}