import { describe, it, expect, beforeEach } from 'vitest'
import { POST, DELETE } from './route'
import { prisma } from '@/lib/db/prisma'
import { vi } from 'vitest'

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    orderImage: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn()
    }
  }
}))

describe('POST /api/orders/[id]/images', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('uploads images successfully', async () => {
    const mockFile = new File(['test image'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('images', mockFile)

    vi.mocked(prisma.orderImage.create).mockResolvedValueOnce({
      id: 1,
      orderId: 1,
      image: Buffer.from('test image'),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const request = new Request('http://localhost:3000/api/orders/1/images', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('orderId', 1)
  })

  it('validates file types', async () => {
    const mockFile = new File(['test file'], 'test.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('images', mockFile)

    const request = new Request('http://localhost:3000/api/orders/1/images', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid file type')
  })
})

describe('DELETE /api/orders/[orderId]/images/[imageId]', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('deletes image successfully', async () => {
    vi.mocked(prisma.orderImage.findUnique).mockResolvedValueOnce({
      id: 1,
      orderId: 1,
      image: Buffer.from('test image'),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    vi.mocked(prisma.orderImage.delete).mockResolvedValueOnce({
      id: 1,
      orderId: 1,
      image: Buffer.from('test image'),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const request = new Request('http://localhost:3000/api/orders/1/images/1', {
      method: 'DELETE'
    })

    const response = await DELETE(request, { params: { orderId: '1', imageId: '1' } })

    expect(response.status).toBe(204)
  })

  it('returns 404 for non-existent image', async () => {
    vi.mocked(prisma.orderImage.findUnique).mockResolvedValueOnce(null)

    const request = new Request('http://localhost:3000/api/orders/1/images/999', {
      method: 'DELETE'
    })

    const response = await DELETE(request, { params: { orderId: '1', imageId: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Image not found')
  })
})
