import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { useStudents } from "../hooks/useStudents";
import { studentSchema } from "../lib/schemas";
import { toastError, toastSuccess } from "../lib/toast";

const emptyStudent = {
  name: "",
  phone: "",
  batch: "",
  subject: "",
  monthly_fee: 0,
  joined_at: new Date().toISOString().slice(0, 10),
};

type StudentFormValues = z.infer<typeof studentSchema>;

export default function Students() {
  const { students, loading, error, addStudent, updateStudent, deleteStudent } =
    useStudents();

  const [filter, setFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: emptyStudent,
  });

  const filteredStudents = useMemo(() => {
    const query = filter.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.batch.toLowerCase().includes(query),
    );
  }, [filter, students]);

  const openAddDialog = () => {
    setEditingId(null);
    reset(emptyStudent);
    setDialogOpen(true);
  };

  const openEditDialog = (student: typeof students[number]) => {
    setEditingId(student.id);
    reset({
      name: student.name,
      phone: student.phone,
      batch: student.batch,
      subject: student.subject,
      monthly_fee: student.monthly_fee,
      joined_at: student.joined_at.slice(0, 10),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const onSubmit = async (values: StudentFormValues) => {
    if (editingId) {
      const { error: updateError } = await updateStudent(editingId, values);
      if (updateError) {
        toastError(updateError.message);
        return;
      }
      toastSuccess("Student updated successfully.");
    } else {
      const { error: addError } = await addStudent(values);
      if (addError) {
        toastError(addError.message);
        return;
      }
      toastSuccess("Student added successfully.");
    }

    closeDialog();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this student?");
    if (!confirmed) return;

    const { error: deleteError } = await deleteStudent(id);
    if (deleteError) {
      toastError(deleteError.message);
      return;
    }

    toastSuccess("Student removed successfully.");
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage your student roster and tuition data.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by name or batch"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="max-w-sm"
          />
          <Button
            onClick={openAddDialog}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add student
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{student.batch}</Badge>
                  </TableCell>
                  <TableCell>{student.subject}</TableCell>
                  <TableCell>${student.monthly_fee.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(student.joined_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(student)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-2 py-6 text-center text-sm text-muted-foreground"
                >
                  {error ? error.message : "No students found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit student" : "Add student"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone ? (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input id="batch" {...register("batch")} />
                {errors.batch ? (
                  <p className="text-sm text-destructive">{errors.batch.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register("subject")} />
                {errors.subject ? (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_fee">Monthly fee</Label>
                <Input
                  id="monthly_fee"
                  type="number"
                  {...register("monthly_fee", { valueAsNumber: true })}
                />
                {errors.monthly_fee ? (
                  <p className="text-sm text-destructive">
                    {errors.monthly_fee.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="joined_at">Joined at</Label>
                <Input id="joined_at" type="date" {...register("joined_at")} />
                {errors.joined_at ? (
                  <p className="text-sm text-destructive">
                    {errors.joined_at.message}
                  </p>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Add student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
