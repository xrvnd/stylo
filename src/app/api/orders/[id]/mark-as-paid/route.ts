import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: {
    id: string;
  };
}

// Define the allowed payment methods for strict type checking
const ALLOWED_PAYMENT_METHODS = ["CASH", "CARD", "UPI"];

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
    }

    const body = await request.json();
    const { paymentMethod } = body;

    // Validate incoming payment method
    if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: 'A valid payment method is required' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: 'PAID',
        paymentMethod: paymentMethod,
      },
    });

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error) {
    // catch errors if the order is not found, for example
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.error('Failed to mark order as paid:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}