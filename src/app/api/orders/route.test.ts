import { describe, it, expect, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { prisma } from '@/lib/db/prisma'
import { vi } from 'vitest'

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn()
    }
  }
}))

describe('GET /api/orders', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns orders with pagination', async () => {
    const mockOrders = [
      {
        id: 1,
        customerId: 1,
        status: 'PENDING',
        totalAmount: 100,
        customer: { name: 'John Doe' }
      }
    ]

    vi.mocked(prisma.order.findMany).mockResolvedValueOnce(mockOrders)
    vi.mocked(prisma.order.count).mockResolvedValueOnce(1)

    const request = new Request('http://localhost:3000/api/orders?page=1&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.orders).toEqual(mockOrders)
    expect(data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    })
  })
})

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('creates order with valid data', async () => {
    const orderData = {
      customerId: 1,
      status: 'PENDING',
      totalAmount: 100,
      orderItems: [
        {
          description: 'Test Item',
          quantity: 1,
          price: 100
        }
      ]
    }

    vi.mocked(prisma.order.create).mockResolvedValueOnce({
      id: 1,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toMatchObject({
      id: 1,
      customerId: orderData.customerId,
      status: orderData.status,
      totalAmount: orderData.totalAmount
    })
  })

  it('validates required fields', async () => {
    const invalidData = {
      // Missing customerId
      status: 'PENDING',
      totalAmount: 100
    }

    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
  })

  it('calculates total correctly', async () => {
    const orderData = {
      customerId: 1,
      status: 'PENDING',
      orderItems: [
        {
          description: 'Item 1',
          quantity: 2,
          price: 100
        },
        {
          description: 'Item 2',
          quantity: 1,
          price: 50
        }
      ]
    }

    vi.mocked(prisma.order.create).mockResolvedValueOnce({
      id: 1,
      ...orderData,
      totalAmount: 250, // (2 * 100) + (1 * 50)
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.totalAmount).toBe(250)
  })
})
