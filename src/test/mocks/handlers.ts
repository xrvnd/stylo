import { http, HttpResponse } from 'msw'

const mockOrders = [
  {
    id: 1,
    customerId: 1,
    status: 'PENDING',
    totalAmount: 100,
    dueDate: '2025-01-10',
    notes: 'Test order 1',
    orderItems: [
      {
        id: 1,
        description: 'Test Item 1',
        quantity: 1,
        price: 100
      }
    ],
    orderImages: [
      {
        id: 1,
        image: new Uint8Array([1, 2, 3]) // Mock image data
      }
    ],
    customer: {
      name: 'John Doe',
      phone: '1234567890'
    }
  },
  {
    id: 2,
    customerId: 2,
    status: 'PAID',
    totalAmount: 200,
    dueDate: '2025-01-15',
    notes: 'Test order 2',
    orderItems: [
      {
        id: 2,
        description: 'Test Item 2',
        quantity: 2,
        price: 100
      }
    ],
    orderImages: [],
    customer: {
      name: 'Jane Smith',
      phone: '0987654321'
    }
  }
]

export const handlers = [
  // Customer handlers
  http.get('/api/customers', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        _count: { orders: 2 }
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        _count: { orders: 1 }
      }
    ])
  }),

  // Order handlers
  http.get('/api/orders', () => {
    return HttpResponse.json(mockOrders)
  }),

  http.get('/api/orders/:id', ({ params }) => {
    const order = mockOrders.find(o => o.id === Number(params.id))
    if (!order) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(order)
  }),

  http.post('/api/orders', async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json({
      id: 3,
      ...data,
      createdAt: new Date().toISOString()
    }, { status: 201 })
  }),

  http.put('/api/orders/:id', async ({ request, params }) => {
    const data = await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      ...data,
      updatedAt: new Date().toISOString()
    })
  }),

  // Image handlers
  http.post('/api/orders/:id/images', async ({ request }) => {
    const formData = await request.formData()
    const images = formData.getAll('images')
    
    return HttpResponse.json({
      images: images.map((_, i) => ({
        id: i + 1,
        orderId: 1,
        image: new Uint8Array([1, 2, 3]) // Mock image data
      }))
    }, { status: 201 })
  }),

  http.delete('/api/orders/:orderId/images/:imageId', () => {
    return new HttpResponse(null, { status: 204 })
  })
]
