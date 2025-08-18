// src/app/api/employees/[id]/route.ts

import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import { employeeSchema } from '@/lib/validations/schema';
import { validateRequest } from '@/lib/validations/middleware';

interface Params {
  params: { id: string };
}

// GET /api/employees/[id] - Fetch a single employee
export async function GET(request: Request, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);

  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// PUT /api/employees/[id] - Update an existing employee
export async function PUT(request: Request, { params }: Params) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    // Validate the incoming JSON data
    const validation = await validateRequest(employeeSchema)(request);
    if (!validation.success) {
      return validation.error;
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedEmployee);

  } catch (error: any) {
    if (error.code === 'P2002') { // Handle unique email constraint
      return NextResponse.json({ error: 'An employee with this email already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') { // Handle case where employee to update is not found
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    console.error('Failed to update employee:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// DELETE /api/employees/[id] - Delete an employee
export async function DELETE(request: Request, { params }: Params) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
          return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
        }
    
        await prisma.employee.delete({
          where: { id },
        });
    
        return NextResponse.json({ message: 'Employee deleted successfully' }, { status: 200 });
    
      } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }
        console.error('Failed to delete employee:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
      }
}