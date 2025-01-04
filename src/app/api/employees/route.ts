import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { employeeSchema } from '@/lib/validations/schema'
import { validateRequest } from '@/lib/validations/middleware'

// GET /api/employees - List all employees
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    // Validate role if provided
    if (role && !['ADMIN', 'EMPLOYEE'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be either ADMIN or EMPLOYEE' },
        { status: 400 }
      )
    }

    const employees = await prisma.employee.findMany({
      where: role ? {
        role: role
      } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// POST /api/employees - Create new employee
export async function POST(request: Request) {
  // Validate request data
  const validation = await validateRequest(employeeSchema)(request)
  if (!validation.success) {
    return validation.error
  }

  try {
    const employee = await prisma.employee.create({
      data: validation.data
    })
    return NextResponse.json(employee, { status: 201 })
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An employee with this email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
