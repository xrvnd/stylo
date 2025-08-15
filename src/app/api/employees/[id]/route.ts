import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import { PaymentType } from '@prisma/client'; // Import the enum

interface Params {
  params: { id: string };
}

export async function POST(request: Request, { params }: Params) {
  try {
    const employeeId = parseInt(params.id, 10);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const body = await request.json();
    // Destructure the type from the body ---
    const { amount, notes, type } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount provided' }, { status: 400 });
    }

    // validate the type
    if (!type || !Object.values(PaymentType).includes(type)) {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
    }

    const payment = await prisma.employeePayment.create({
      data: {
        employeeId,
        amount,
        notes,
        type, // Save the type
        paymentDate: new Date(),
      },
    });

    return NextResponse.json(payment, { status: 201 });

  } catch (error) {
    console.error('Failed to create employee payment:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}