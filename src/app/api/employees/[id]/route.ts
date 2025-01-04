import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { employeeSchema } from '@/lib/validations/schema'
import { validateRequest, validateId } from '@/lib/validations/middleware'

interface Params {
  params: {
    id: string
  }
}

// GET /api/employees/[id] - Get specific employee
export async function GET(request: Request, { params }: Params) {
  const validation = validateId(params.id)
  if (!validation.success) {
    return validation.error
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: validation.id
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Get assigned orders count
    const assignedOrders = await prisma.order.count({
      where: {
        employeeId: employee.id
      }
    })

    return NextResponse.json({
      ...employee,
      assignedOrders
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(request: Request, { params }: Params) {
  const idValidation = validateId(params.id)
  if (!idValidation.success) {
    return idValidation.error
  }

  const validation = await validateRequest(employeeSchema)(request)
  if (!validation.success) {
    return validation.error
  }

  try {
    const employee = await prisma.employee.update({
      where: {
        id: idValidation.id
      },
      data: validation.data
    })
    return NextResponse.json(employee)
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An employee with this email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(request: Request, { params }: Params) {
  const validation = validateId(params.id)
  if (!validation.success) {
    return validation.error
  }

  try {
    // Check if employee has any assigned orders
    const assignedOrders = await prisma.order.count({
      where: {
        employeeId: validation.id
      }
    })

    if (assignedOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete employee with assigned orders' },
        { status: 400 }
      )
    }

    await prisma.employee.delete({
      where: {
        id: validation.id
      }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
