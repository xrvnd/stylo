import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

// Define our allowed types inside the application
const ALLOWED_PAYMENT_TYPES = ["SALARY", "PETTY_CASH", "OTHER"];

export async function POST(request: Request, { params }: Params) {
  try {
    const employeeId = parseInt(params.id, 10);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const body = await request.json();
    // --- REVERT: Destructure the 'type' from the body again ---
    const { amount, notes, type } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount provided' }, { status: 400 });
    }

    // --- REVERT: Restore the validation for the 'type' field ---
    if (!type || !ALLOWED_PAYMENT_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid payment type provided' }, { status: 400 });
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