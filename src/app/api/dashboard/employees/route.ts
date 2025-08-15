import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        // We fetch all payments for each employee
        payments: {
          select: {
            amount: true,
          },
        },
      },
    });

    // We process the data to calculate the total for each employee
    const employeeTotals = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      totalPaid: emp.payments.reduce((sum, payment) => sum + payment.amount, 0),
    }));

    return NextResponse.json(employeeTotals);

  } catch (error) {
    console.error('Failed to fetch employee dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}