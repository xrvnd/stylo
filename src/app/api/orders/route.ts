import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

// Define our allowed work types for validation
const ALLOWED_WORK_TYPES = ["SIMPLE_WORK", "HAND_WORK", "MACHINE_WORK"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const dataString = formData.get('data');
    if (typeof dataString !== 'string') {
      return NextResponse.json({ error: 'Form data is missing or invalid.' }, { status: 400 });
    }

    const data = JSON.parse(dataString);
    const {
      orderId,
      customerId,
      employeeId,
      orderItems,
      notes,
      dueDate,
      advanceAmount: advanceAmountStr,
    } = data;

    if (!orderId || !customerId || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: orderId, customerId, or items.' }, { status: 400 });
    }

    const images: File[] = formData.getAll('images').filter((val): val is File => val instanceof File);

    const totalAmount = orderItems.reduce(
      (sum: number, item: { quantity: number; price: number }) => sum + (item.quantity * item.price),
      0
    );
    const advanceAmount = parseInt(advanceAmountStr, 10) || 0;
    const employeeIdInt = employeeId ? parseInt(employeeId, 10) : null;

    const order = await prisma.order.create({
      data: {
        orderId: parseInt(orderId, 10),
        customer: {
          connect: { id: parseInt(customerId, 10) },
        },
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
          // --- MODIFICATION: The 'workType' is now included for each item ---
          create: orderItems.map((item: { description: string; quantity: number; price: number; workType?: string }) => {
            // Validate the workType or fall back to the default
            const workType = item.workType && ALLOWED_WORK_TYPES.includes(item.workType)
              ? item.workType
              : "SIMPLE_WORK";
            return {
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              workType: workType,
            };
          }),
        },
        ...(images.length > 0 && {
          orderImages: {
            create: await Promise.all(images.map(async (image) => ({
              image: Buffer.from(await image.arrayBuffer()),
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Invalid Customer or Employee ID.' }, { status: 400 });
      }
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON data provided.' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
