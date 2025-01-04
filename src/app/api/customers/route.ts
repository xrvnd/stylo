import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { customerSchema } from '@/lib/validations/schema'
import { validateRequest } from '@/lib/validations/middleware'

// GET /api/customers - List all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create new customer
export async function POST(request: Request) {
  // Validate request data
  const validation = await validateRequest(customerSchema)(request)
  if (!validation.success) {
    return validation.error
  }

  try {
    const customer = await prisma.customer.create({
      data: validation.data
    })
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
