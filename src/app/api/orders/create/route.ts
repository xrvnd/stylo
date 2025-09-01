import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const dataString = formData.get('data');
    if (typeof dataString !== 'string') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const data = JSON.parse(dataString);
    const { orderId, customerId, employeeId, orderItems, notes, dueDate, advancePayment } = data;

    // A simpler, more correct validation
    if (!orderId || !customerId || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json({ error: 'Order ID, Customer, and at least one item are required.' }, { status: 400 });
    }

    const images: File[] = [];
    formData.forEach((value, key) => {
      if (key === 'images' && value instanceof File) {
        images.push(value);
      }
    });

    const totalAmount = orderItems.reduce(
      (sum: number, item: { price: string | number }) => sum + (Number(item.price) || 0), 0
    );

    const createdOrder = await prisma.order.create({
      data: {
        orderId: parseInt(orderId),
        customer: { connect: { id: parseInt(customerId) } },
        employee: employeeId ? { connect: { id: parseInt(employeeId) } } : undefined,
        totalAmount,
        advanceAmount: Number(advancePayment) || 0,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        orderItems: {
          create: orderItems.map((item: any) => ({
            description: item.description,
            quantity: 1,
            price: Number(item.price) || 0,
            workType: item.workType || "SIMPLE_WORK",
            itemNotes: item.itemNotes || null,
            itemStatus: item.itemStatus === "DONE" ? "DONE" : "NOT_DONE",
          })),
        },
        orderImages: {
            create: await Promise.all(images.map(async (file) => ({
              image: Buffer.from(await file.arrayBuffer()),
            }))),
        },
      },
      include: { customer: true, employee: true, orderItems: true },
    });
    
    return NextResponse.json(createdOrder, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json({ error: 'Database error: A specified customer or employee may not exist.' }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}