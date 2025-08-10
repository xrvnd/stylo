'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

interface Customer {
  id: number
  name: string
  nickname: string | null
  email: string | null
  phone: string
  _count: {
    orders: number
  }
}

interface CustomerTableProps {
  customers: Customer[]
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      customer.name.toLowerCase().includes(search) ||
      (customer.nickname?.toLowerCase() || '').includes(search) ||
      customer.phone.includes(searchTerm)

    const matchesSelection =
      !selectedCustomerId || customer.id.toString() === selectedCustomerId

    return matchesSearch && matchesSelection
  })

  // Get selected customer for phone display
  const selectedCustomer = customers.find(
    (c) => c.id.toString() === selectedCustomerId
  )

  return (
    <div className="space-y-4">
      {/* Select customer dropdown */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          onValueChange={(value) => setSelectedCustomerId(value)}
          value={selectedCustomerId}
        >
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select a customer..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Display selected phone number */}
        {selectedCustomer && (
          <div className="text-sm text-muted-foreground">
            📞 {selectedCustomer.phone}
          </div>
        )}

        {/* Search box */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, nickname, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Nickname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.nickname || '-'}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer._count.orders}</TableCell>
                <TableCell>
                  <Button variant="ghost" asChild>
                    <Link href={`/customers/${customer.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
