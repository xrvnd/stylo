import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    // Parse the multipart/form-data request
    const formData = await request.formData();

    // The "data" field should be a JSON string with all non-file fields
    const dataString = formData.get('data');
    if (typeof dataString !== 'string') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const data = JSON.parse(dataString);
    const { orderId, customerId, employeeId, orderItems, notes, dueDate } = data;

    // Validate inputs
    if (
      typeof orderId !== 'number' ||
      isNaN(orderId) ||
      orderId < 1 ||
      typeof customerId !== 'number' ||
      isNaN(customerId) ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Collect uploaded images (optional)
    const images: File[] = [];
    formData.forEach((value, key) => {
      if (key === 'images' && value instanceof File) {
        images.push(value);
      }
    });

    // Calculate total
    const totalAmount = orderItems.reduce(
      (sum: number, item: { quantity: number; price: number }) =>
        sum + (item.quantity * item.price),
      0
    );

    // Create the order and items in a transaction
    const order = await prisma.$transaction(async (prismaTx) => {
      const createdOrder = await prismaTx.order.create({
        data: {
          orderId,
          customerId,
          employeeId,
          totalAmount,
          notes,
          dueDate: dueDate ? new Date(dueDate) : null,
          orderItems: {
            create: orderItems.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price,
            })),
          },
          // If you store image paths in DB:
          // images: images.map(file => file.name)
        },
        include: {
          customer: true,
          employee: true,
          orderItems: true,
        },
      });

      return createdOrder;
    });

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
