import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

const ALLOWED_WORK_TYPES = ["SIMPLE_WORK", "HAND_WORK", "MACHINE_WORK"];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      // FIX: Using `select` to prevent circular JSON errors
      select: {
        id: true,
        orderId: true,
        employeeId: true,
        notes: true,
        dueDate: true,
        advanceAmount: true,
        status: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        customer: true, // Including the full customer is safe
        employee: true, // Including the full employee is safe
        orderItems: {   // For items, we select all their fields, which breaks the loop
          select: {
            id: true,
            description: true,
            quantity: true,
            price: true,
            workType: true,
          }
        },
        orderImages: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
  
    try {
      const formData = await request.formData();
      const dataString = formData.get('data');
      if (typeof dataString !== 'string') {
        return NextResponse.json({ error: 'Form data is missing' }, { status: 400 });
      }
  
      const data = JSON.parse(dataString);
      const { employeeId, notes, dueDate, advancePaid, items } = data;
  
      const imageIdsToKeep = JSON.parse(formData.get('imageIds') as string || '[]') as number[];
      const newImageFiles = formData.getAll('images').filter((val): val is File => val instanceof File);
  
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const existingImages = await tx.orderImage.findMany({
          where: { orderId },
          select: { id: true },
        });
        const imageIdsToDelete = existingImages
          .filter(img => !imageIdsToKeep.includes(img.id))
          .map(img => img.id);
  
        if (imageIdsToDelete.length > 0) {
          await tx.orderImage.deleteMany({
            where: { id: { in: imageIdsToDelete } },
          });
        }
  
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
        
        const orderUpdateData = {
          notes,
          dueDate: dueDate ? new Date(dueDate) : null,
          advanceAmount: advancePaid,
          totalAmount,
          employeeId: employeeId ? parseInt(employeeId, 10) : null,
          orderItems: {
            deleteMany: {},
            create: items.map((item: any) => {
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
          orderImages: {
            create: await Promise.all(newImageFiles.map(async (file) => ({
              image: Buffer.from(await file.arrayBuffer()),
            }))),
          },
        };
  
        return tx.order.update({
          where: { id: orderId },
          data: orderUpdateData,
          include: { orderItems: true, orderImages: true },
        });
      });
  
      return NextResponse.json(updatedOrder, { status: 200 });
  
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    if ((error as any).code === 'P2025') {
       return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}