import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from './route'
import { prisma } from '@/lib/db/prisma'
import { vi } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    customer: {
      create: vi.fn(),
      findFirst: vi.fn()
    }
  }
}))

describe('POST /api/customers', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('creates a new customer with valid data', async () => {
    const customerData = {
      name: 'John Doe',
      phone: '1234567890',
      email: 'john@example.com'
    }

    const mockRequest = new Request('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    })

    // Mock the Prisma create call
    vi.mocked(prisma.customer.create).mockResolvedValueOnce({
      id: 1,
      ...customerData,
      nickname: null,
      address: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(201) 
    expect(data).toMatchObject({
      id: 1,
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email
    })
  })

  it('returns validation error for invalid data', async () => {
    const invalidData = {
      name: 'Jo', 
      phone: '123', 
      email: 'invalid-email' 
    }

    const mockRequest = new Request('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toBeDefined()
  })
})
