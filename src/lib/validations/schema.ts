import { z } from 'zod'

// Customer schemas
export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nickname: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().optional().nullable(),
  paperCutting: z.boolean().default(false)
})

// Order schemas
export const orderItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().int().positive('Price must be positive')
})

export const orderImageSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive()
}).optional()

export const orderSchema = z.object({
  customerId: z.number().int().positive(),
  employeeId: z.number().int().positive().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'PAID']).default('PENDING'),
  totalAmount: z.number().int().positive(),
  notes: z.string().optional().nullable(),
  orderItems: z.array(orderItemSchema),
  orderImages: z.array(orderImageSchema).optional()
})

// Employee schemas
export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE')
})
