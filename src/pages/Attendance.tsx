import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "../lib/toast";
import { attendanceSchema } from "../lib/schemas";
import { Button } from "../components/ui/button";
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
import { useAttendance } from "../hooks/useAttendance";
import { useStudents } from "../hooks/useStudents";

const getToday = () => new Date().toISOString().slice(0, 10);

const formatDateKey = (value: string) =>
  new Date(value).toISOString().slice(0, 10);

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export default function Attendance() {
  const { students, loading: studentsLoading } = useStudents();
  const {
    attendance,
    loading: attendanceLoading,
    error,
    fetchAttendance,
    upsertAttendance,
  } = useAttendance();

  const [attendanceState, setAttendanceState] = useState<
    Record<string, "present" | "absent">
  >({});

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      batch: "",
      date: getToday(),
    },
  });

  const watchBatch = watch("batch");
  const watchDate = watch("date");

  const batches = useMemo(
    () => Array.from(new Set(students.map((student) => student.batch))).sort(),
    [students],
  );

  useEffect(() => {
    if (!watchBatch && batches.length > 0) {
      setValue("batch", batches[0]);
    }
  }, [batches, setValue, watchBatch]);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    fetchAttendance(firstDay, lastDay);
  }, [fetchAttendance]);

  useEffect(() => {
    const dateKey = formatDateKey(watchDate);
    const newState: Record<string, "present" | "absent"> = {};

    students
      .filter((student) => student.batch === watchBatch)
      .forEach((student) => {
        const record = attendance.find(
          (entry) =>
            formatDateKey(entry.date) === dateKey &&
            entry.student_id === student.id,
        );
        newState[student.id] = record?.status ?? "absent";
      });

    setAttendanceState(newState);
  }, [attendance, students, watchBatch, watchDate]);

  const batchStudents = useMemo(
    () => students.filter((student) => student.batch === watchBatch),
    [students, watchBatch],
  );

  const summary = useMemo(
    () =>
      batchStudents.map((student) => {
        const records = attendance.filter(
          (record) => record.student_id === student.id,
        );
        const present = records.filter(
          (record) => record.status === "present",
        ).length;
        const total = records.length;
        const percentage = total ? Math.round((present / total) * 100) : 0;
        return {
          student,
          present,
          absent: total - present,
          percentage,
        };
      }),
    [attendance, batchStudents],
  );

  const handleToggle = (studentId: string, status: "present" | "absent") => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const onSubmit = async (values: AttendanceFormValues) => {
    setSubmitError(null);

    const records = batchStudents.map((student) => ({
      student_id: student.id,
      date: values.date,
      status: attendanceState[student.id] ?? "absent",
    }));

    const { data, error: submitErrorResult } = await upsertAttendance(records);
    if (submitErrorResult) {
      setSubmitError(submitErrorResult.message);
      toastError(submitErrorResult.message);
      return;
    }

    if (!data) {
      setSubmitError("Unable to save attendance.");
      toastError("Unable to save attendance.");
      return;
    }

    toastSuccess("Attendance saved successfully.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Track attendance by batch and date.
          </p>
        </div>

        <form
          className="grid gap-4 sm:grid-cols-[220px_220px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <select
              id="batch"
              {...register("batch")}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {batches.map((batchOption) => (
                <option key={batchOption} value={batchOption}>
                  {batchOption}
                </option>
              ))}
            </select>
            {errors.batch ? (
              <p className="text-sm text-destructive">{errors.batch.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendanceDate">Date</Label>
            <Input id="attendanceDate" type="date" {...register("date")} />
            {errors.date ? (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            ) : null}
          </div>

          <div className="flex items-end gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !watchBatch || batchStudents.length === 0}
            >
              {isSubmitting ? "Saving..." : "Save attendance"}
            </Button>
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Student attendance</h2>
            <span className="text-sm text-muted-foreground">
              {batchStudents.length} students
            </span>
          </div>

          {studentsLoading || attendanceLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border border-border bg-muted/40 p-4"
                >
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : batchStudents.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              No students found for selected batch.
            </div>
          ) : (
            <div className="space-y-3">
              {batchStudents.map((student) => {
                const status = attendanceState[student.id] ?? "absent";
                return (
                  <div
                    key={student.id}
                    className="flex flex-col gap-3 rounded-xl border border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.subject}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant={status === "present" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleToggle(student.id, "present")}
                      >
                        Present
                      </Button>
                      <Button
                        variant={
                          status === "absent" ? "destructive" : "outline"
                        }
                        size="sm"
                        onClick={() => handleToggle(student.id, "absent")}
                      >
                        Absent
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error ? (
            <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error.message}
            </div>
          ) : null}

          {submitError ? (
            <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Month summary</h2>
            <p className="text-sm text-muted-foreground">
              Attendance percentage for {new Date().toLocaleString("default", { month: "long" })}.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map(({ student, present, absent, percentage }) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{present}</TableCell>
                  <TableCell>{absent}</TableCell>
                  <TableCell>{percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
