import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { useFees } from "../hooks/useFees";
import { useStudents } from "../hooks/useStudents";
import { feePaymentSchema } from "../lib/schemas";
import { toastError, toastSuccess } from "../lib/toast";

const paymentMethods = ["Cash", "bKash", "Nagad", "Bank"];

type FeePaymentFormValues = z.infer<typeof feePaymentSchema>;

export default function Fees() {
  const { fees, loading, error, fetchFees, recordPayment } = useFees();
  const { students, loading: studentsLoading } = useStudents();
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeePaymentFormValues>({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: {
      student_id: "",
      month: "",
      amount: 0,
      payment_method: paymentMethods[0],
    },
  });

  const selectedStudentId = watch("student_id");

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const feesByStudent = useMemo(() => {
    return students
      .filter((student) => fees.some((fee) => fee.student_id === student.id))
      .map((student) => ({
        ...student,
        feeRecords: fees.filter((fee) => fee.student_id === student.id),
      }));
  }, [fees, students]);

  const monthsForStudent = useMemo(() => {
    return fees
      .filter((fee) => fee.student_id === selectedStudentId)
      .map((fee) => fee.month);
  }, [fees, selectedStudentId]);

  useEffect(() => {
    if (!selectedStudentId && feesByStudent.length > 0) {
      reset((current) => ({
        ...current,
        student_id: feesByStudent[0].id,
        month:
          monthsForStudent.length > 0 ? monthsForStudent[0] : current.month,
      }));
    }
  }, [feesByStudent, monthsForStudent, reset, selectedStudentId]);

  useEffect(() => {
    if (selectedStudentId && monthsForStudent.length > 0) {
      reset((current) => ({
        ...current,
        month: monthsForStudent.includes(current.month)
          ? current.month
          : monthsForStudent[0],
      }));
    }
  }, [selectedStudentId, monthsForStudent, reset]);

  const totals = useMemo(() => {
    const totalDue = fees.reduce((sum, fee) => sum + fee.amount_due, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + fee.amount_paid, 0);
    const outstanding = totalDue - totalPaid;
    return { totalDue, totalPaid, outstanding };
  }, [fees]);

  const onSubmit = async (values: FeePaymentFormValues) => {
    const feeRecord = fees.find(
      (fee) => fee.student_id === values.student_id && fee.month === values.month,
    );

    if (!feeRecord) {
      toastError("No fee record found for the selected student and month.");
      return;
    }

    const { error: paymentError } = await recordPayment(
      feeRecord.id,
      values.amount,
      values.payment_method,
    );
    if (paymentError) {
      toastError(paymentError.message);
      return;
    }

    toastSuccess("Payment recorded successfully.");
    setDialogOpen(false);
    reset({
      student_id: values.student_id,
      month: values.month,
      amount: 0,
      payment_method: paymentMethods[0],
    });
  };

  const formatStatus = (fee: (typeof fees)[number]) => {
    if (fee.amount_paid >= fee.amount_due) {
      return { label: "Paid", variant: "default" as const };
    }
    const now = new Date();
    const feeMonth = new Date(`${fee.month}-01`);
    const overdue = feeMonth < new Date(now.getFullYear(), now.getMonth(), 1);
    return overdue
      ? { label: "Overdue", variant: "destructive" as const }
      : { label: "Due", variant: "secondary" as const };
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Total due
          </p>
          <p className="mt-3 text-3xl font-semibold">
            ${totals.totalDue.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Collected
          </p>
          <p className="mt-3 text-3xl font-semibold">
            ${totals.totalPaid.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Outstanding
          </p>
          <p className="mt-3 text-3xl font-semibold">
            ${totals.outstanding.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fees</h1>
          <p className="text-sm text-muted-foreground">
            Record payments and monitor outstanding balances.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record payment
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Record payment</DialogTitle>
              <DialogDescription>
                Select a fee record and log the payment details.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <select
                  id="student"
                  {...register("student_id")}
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select student</option>
                  {feesByStudent.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                {errors.student_id ? (
                  <p className="text-sm text-destructive">
                    {errors.student_id.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <select
                  id="month"
                  {...register("month")}
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select month</option>
                  {monthsForStudent.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                {errors.month ? (
                  <p className="text-sm text-destructive">{errors.month.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount ? (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment method</Label>
                <select
                  id="payment_method"
                  {...register("payment_method")}
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                {errors.payment_method ? (
                  <p className="text-sm text-destructive">
                    {errors.payment_method.message}
                  </p>
                ) : null}
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Record payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(loading || studentsLoading) &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && !studentsLoading && fees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-2 py-6 text-center text-sm text-muted-foreground"
                >
                  No fee records available.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading &&
              !studentsLoading &&
              fees.map((fee) => {
                const student = students.find((student) => student.id === fee.student_id);
                const balance = fee.amount_due - fee.amount_paid;
                const status = formatStatus(fee);
                return (
                  <TableRow key={fee.id}>
                    <TableCell>{student?.name ?? "Unknown"}</TableCell>
                    <TableCell>{fee.month}</TableCell>
                    <TableCell>${fee.amount_due.toFixed(2)}</TableCell>
                    <TableCell>${fee.amount_paid.toFixed(2)}</TableCell>
                    <TableCell>${balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}
    </section>
  );
}
