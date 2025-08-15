import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getOrderById } from "@/lib/data/orders"
// --- MODIFICATION: Import the new client component ---
import { ImageViewer } from "./ImageViewer";

const formatWorkType = (workType: string | null) => {
  if (!workType) return "Simple Work";
  return workType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(parseInt(id));

  if (!order) {
    notFound();
  }

  const totalAmount = order.totalAmount ?? 0;
  const advanceAmount = order.advanceAmount ?? 0;
  const remainingDue = totalAmount - advanceAmount;

  const images =
    order.orderImages?.map((img) => {
      if (!img.image) return null;
      const base64 = Buffer.from(img.image).toString("base64");
      return `data:image/jpeg;base64,${base64}`;
    }).filter(Boolean) || [];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {order.customer?.name}</p>
            <p><strong>Phone:</strong> {order.customer?.phone}</p>
            <p><strong>Email:</strong> {order.customer?.email || "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Employee:</strong> {order.employee?.name || "N/A"}</p>
            <p><strong>Due Date:</strong> {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "N/A"}</p>
            <p><strong>Notes:</strong> {order.notes || "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
            <p><strong>Advance Paid:</strong> ₹{advanceAmount.toLocaleString()}</p>
            <p><strong>Remaining Due:</strong> ₹{remainingDue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Work Type</th>
                <th className="text-left p-2">Quantity</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2">{formatWorkType(item.workType)}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">₹{item.price.toLocaleString()}</td>
                  <td className="p-2">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            {/* --- MODIFICATION: Replace the old div with our new interactive component (Dialog) --- */}
            <ImageViewer images={images} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
