import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// defining shape of an order item after parsing
type OrderItem = {
  description: string;
  quantity: number;
  price: number;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // extract and validate data from FormData
    const orderId = formData.get('orderId') as string;
    const customerId = formData.get('customerId') as string;
    const employeeId = formData.get('employeeId') as string | null;
    const dueDate = formData.get('dueDate') as string | null;
    const notes = formData.get('notes') as string | null;
    const advancePaymentStr = formData.get('advancePayment') as string;
    const orderItemsStr = formData.get('orderItems') as string;
    const images = formData.getAll('images') as File[];

    if (!orderId || !customerId || !orderItemsStr) {
      return NextResponse.json({ error: 'Missing required fields: orderId, customerId, orderItems' }, { status: 400 });
    }

    const orderItems: OrderItem[] = JSON.parse(orderItemsStr);
    const advanceAmount = parseInt(advancePaymentStr || '0', 10);

    // --- Business Logic ---
    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const status = advanceAmount >= totalAmount ? 'PAID' : 'PENDING';

    // prepare image data for Prisma
    const imageBuffers = await Promise.all(
      images.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return { image: buffer };
      })
    );
    
    // database Transaction
    const newOrder = await prisma.order.create({
      data: {
        orderId: parseInt(orderId, 10),
        customerId: parseInt(customerId, 10),
        employeeId: employeeId ? parseInt(employeeId, 10) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes: notes,
        totalAmount: totalAmount,
        advanceAmount: advanceAmount,
        status: status,
        orderItems: {
          create: orderItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        orderImages: {
          create: imageBuffers,
        },
      },
      // include related data in the response if needed
      include: {
        orderItems: true,
        orderImages: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error('Failed to create order:', error);
    // handle future JSON parsing errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid format for order items.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal error occurred while creating the order.' }, { status: 500 });
  }
}