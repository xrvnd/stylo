import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { customerSchema } from '@/lib/validations/schema'
import { validateRequest, validateId } from '@/lib/validations/middleware'

interface Params {
  params: {
    id: string
  }
}

// GET /api/customers/[id] - Get specific customer
export async function GET(request: Request, { params }: Params) {
  const validation = validateId(params.id)
  if (!validation.success) {
    return validation.error
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: validation.id
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(request: Request, { params }: Params) {
  const idValidation = validateId(params.id)
  if (!idValidation.success) {
    return idValidation.error
  }

  const validation = await validateRequest(customerSchema)(request)
  if (!validation.success) {
    return validation.error
  }

  try {
    const customer = await prisma.customer.update({
      where: {
        id: idValidation.id
      },
      data: validation.data
    })
    return NextResponse.json(customer)
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(request: Request, { params }: Params) {
  const validation = validateId(params.id)
  if (!validation.success) {
    return validation.error
  }

  try {
    await prisma.customer.delete({
      where: {
        id: validation.id
      }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
