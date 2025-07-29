// src/app/api/orders/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const orderId = parseInt(formData.get('orderId') as string)
    const customerId = parseInt(formData.get('customerId') as string)
    const employeeId = formData.get('employeeId') ? parseInt(formData.get('employeeId') as string) : null
    const notes = formData.get('notes') as string | null
    const dueDate = formData.get('dueDate') as string | null

    const orderItems = JSON.parse(formData.get('orderItems') as string)
    const imageFiles = formData.getAll('images') as File[]

    const totalAmount = orderItems.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderId,
          customerId,
          employeeId,
          notes,
          dueDate: dueDate ? new Date(dueDate) : null,
          totalAmount,
          orderItems: {
            create: orderItems.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      if (imageFiles.length > 0) {
        const imageCreations = imageFiles.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return tx.orderImage.create({
            data: {
              orderId: newOrder.id,
              image: buffer,
            },
          });
        });
        await Promise.all(imageCreations);
      }

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          customer: true,
          employee: true,
          orderItems: true,
          orderImages: true,
        },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}