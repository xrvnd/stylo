import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { CustomerTable } from './customer-table'

const mockCustomers = [
  {
    id: 1,
    name: 'John Doe',
    nickname: 'Johnny',
    email: 'john@example.com',
    phone: '1234567890',
    _count: { orders: 2 }
  },
  {
    id: 2,
    name: 'Jane Smith',
    nickname: null,
    email: 'jane@example.com',
    phone: '0987654321',
    _count: { orders: 1 }
  }
]

describe('CustomerTable', () => {
  it('renders all customers', () => {
    render(<CustomerTable customers={mockCustomers} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('filters customers by name', async () => {
    const { user } = render(<CustomerTable customers={mockCustomers} />)
    
    const searchInput = screen.getByPlaceholderText(/search by name/i)
    await user.type(searchInput, 'John')
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('filters customers by phone', async () => {
    const { user } = render(<CustomerTable customers={mockCustomers} />)
    
    const searchInput = screen.getByPlaceholderText(/search by name/i)
    await user.type(searchInput, '1234')
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('shows no results message when no customers match search', async () => {
    const { user } = render(<CustomerTable customers={mockCustomers} />)
    
    const searchInput = screen.getByPlaceholderText(/search by name/i)
    await user.type(searchInput, 'xyz')
    
    expect(screen.getByText(/no customers found/i)).toBeInTheDocument()
  })
})
