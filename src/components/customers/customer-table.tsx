"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: number;
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string;
  _count: {
    orders: number;
  };
}

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const handleDelete = async (customerId: number) => {
    if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success("Customer deleted successfully.");
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete the customer.");
      }
    } catch (error) {
      console.error("An error occurred during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      customer.name.toLowerCase().includes(search) ||
      (customer.nickname?.toLowerCase() || "").includes(search) ||
      customer.phone.includes(searchTerm);
    const matchesSelection =
      !selectedCustomerId || customer.id.toString() === selectedCustomerId;
    return matchesSearch && matchesSelection;
  });

  const selectedCustomer = customers.find(
    (c) => c.id.toString() === selectedCustomerId
  );

  return (
    <div className="space-y-4">
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
                <div className="flex flex-col">
                  <span>{customer.name}</span>
                  <span className="text-xs text-gray-500">
                    {customer.phone}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCustomer && (
          <div className="text-sm text-muted-foreground">
            📞 {selectedCustomer.phone}
          </div>
        )}
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Nickname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Total Orders</TableHead>
            {/* --- MODIFICATION 1: Centering the header text --- */}
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.nickname || "-"}</TableCell>
                <TableCell>{customer.email || "-"}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer._count.orders}</TableCell>
                {/* --- MODIFICATION 2: Centering the cell content --- */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/customers/${customer.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/customers/${customer.id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}