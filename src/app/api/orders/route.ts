import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const dataString = formData.get('data');
    if (typeof dataString !== 'string') {
      return NextResponse.json({ error: 'Form data is missing or invalid.' }, { status: 400 });
    }

    const data = JSON.parse(dataString);
    const {
      orderId, // This is the user-provided display ID
      customerId,
      employeeId,
      orderItems,
      notes,
      dueDate,
      advanceAmount: advanceAmountStr,
    } = data;

    // --- Data Validation ---
    if (!orderId || !customerId || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: orderId, customerId, or items.' }, { status: 400 });
    }

    const images: File[] = formData.getAll('images').filter((val): val is File => val instanceof File);

    // --- Data Transformation & Calculation ---
    const totalAmount = orderItems.reduce(
      (sum: number, item: { quantity: number; price: number }) => sum + (item.quantity * item.price),
      0
    );
    const advanceAmount = parseInt(advanceAmountStr, 10) || 0;
    const employeeIdInt = employeeId ? parseInt(employeeId, 10) : null;

    // --- Database Transaction ---
    const order = await prisma.order.create({
      data: {
        orderId: parseInt(orderId, 10), // Storing the user-provided ID
        customer: {
          connect: { id: parseInt(customerId, 10) },
        },
        // Conditionally connect employee if employeeIdInt is a valid number
        ...(employeeIdInt && !isNaN(employeeIdInt) && {
          employee: {
            connect: { id: employeeIdInt },
          },
        }),
        totalAmount,
        advanceAmount,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
        orderItems: {
          create: orderItems.map((item: { description: string; quantity: number; price: number }) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        // Process and include images if they exist
        ...(images.length > 0 && {
          orderImages: {
            create: await Promise.all(images.map(async (image) => ({
              image: Buffer.from(await image.arrayBuffer()), // Store image as Bytes
            }))),
          },
        }),
      },
      include: {
        customer: true,
        employee: true,
        orderItems: true,
        orderImages: true,
      },
    });

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    // Handle Prisma-specific errors for better client feedback
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Foreign key constraint failed
        return NextResponse.json({ error: 'Invalid Customer or Employee ID.' }, { status: 400 });
      }
    }
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON data provided.' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}