import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@/test/utils'
import { OrderList } from './order-list'

const mockOrders = [
  {
    id: 1,
    customerId: 1,
    status: 'PENDING',
    totalAmount: 100,
    dueDate: '2025-01-10',
    notes: 'Test order 1',
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
    customer: {
      name: 'Jane Smith',
      phone: '0987654321'
    }
  }
]

describe('OrderList', () => {
  it('displays orders correctly', () => {
    render(<OrderList orders={mockOrders} />)
    
    const orders = screen.getAllByRole('row')
    expect(orders).toHaveLength(mockOrders.length + 1) // +1 for header row

    const firstOrder = within(orders[1]).getAllByRole('cell')
    expect(firstOrder[0]).toHaveTextContent('John Doe')
    expect(firstOrder[1]).toHaveTextContent('PENDING')
    expect(firstOrder[2]).toHaveTextContent('₹100')
  })

  it('sorts orders by date', async () => {
    const { user } = render(<OrderList orders={mockOrders} />)
    
    const dateHeader = screen.getByText(/due date/i)
    await user.click(dateHeader)
    
    const orders = screen.getAllByRole('row')
    const firstOrderDate = within(orders[1]).getByText('2025-01-10')
    const secondOrderDate = within(orders[2]).getByText('2025-01-15')
    
    expect(firstOrderDate).toBeInTheDocument()
    expect(secondOrderDate).toBeInTheDocument()
  })

  it('filters by status', async () => {
    const { user } = render(<OrderList orders={mockOrders} />)
    
    const statusFilter = screen.getByLabelText(/status/i)
    await user.selectOptions(statusFilter, 'PAID')
    
    const orders = screen.getAllByRole('row')
    expect(orders).toHaveLength(2) // Header + 1 PAID order
    expect(within(orders[1]).getByText('PAID')).toBeInTheDocument()
  })
})
