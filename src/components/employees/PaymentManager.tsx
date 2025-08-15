"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EmployeePayment } from "@prisma/client";

interface PaymentManagerProps {
  employeeId: number;
  initialPayments: EmployeePayment[];
}

export function PaymentManager({ employeeId, initialPayments }: PaymentManagerProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<EmployeePayment[]>(initialPayments);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  // --- REVERT: The 'paymentType' state is restored ---
  const [paymentType, setPaymentType] = useState<string>("SALARY");
  const [loading, setLoading] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(amount, 10);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`/api/employees/${employeeId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // --- REVERT: Send the 'type' in the request body ---
        body: JSON.stringify({ amount: numericAmount, notes, type: paymentType }),
      });

      if (!response.ok) {
        throw new Error("Failed to record payment.");
      }

      const newPayment = await response.json();
      setPayments(prevPayments => [newPayment, ...prevPayments]);
      
      toast.success("Payment recorded successfully!");
      setAmount('');
      setNotes('');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Record Cash Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* --- REVERT: The 'Payment Type' Select dropdown is restored --- */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={paymentType} onValueChange={(value: string) => setPaymentType(value)}>
                <SelectTrigger id="paymentType">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALARY">Salary</SelectItem>
                  <SelectItem value="PETTY_CASH">Petty Cash</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., July Salary, Office Supplies"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total cash paid out: <span className="font-bold">₹{totalPaid.toFixed(2)}</span>
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {/* --- REVERT: 'Type' column is restored --- */}
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.paymentDate), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{payment.type.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell>{payment.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No payments recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}