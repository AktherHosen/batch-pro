import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useGrades } from "../hooks/useGrades";
import { useStudents } from "../hooks/useStudents";
import { gradeSchema } from "../lib/schemas";
import { toastError, toastSuccess } from "../lib/toast";

const letterGrade = (score: number, maxScore: number) => {
  const pct = maxScore ? (score / maxScore) * 100 : 0;
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
};

type GradeFormValues = z.infer<typeof gradeSchema>;

export default function Grades() {
  const { grades, loading, fetchGrades, addExam } = useGrades();
  const { students, loading: studentsLoading } = useStudents();
  const [batch, setBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      student_id: "",
      exam_name: "",
      subject: "",
      score: 0,
      max_score: 100,
      exam_date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const batches = useMemo(
    () => Array.from(new Set(students.map((student) => student.batch))).sort(),
    [students],
  );

  const subjects = useMemo(
    () => Array.from(new Set(grades.map((entry) => entry.subject))).sort(),
    [grades],
  );

  const filteredGrades = useMemo(() => {
    return grades.filter((entry) => {
      const student = students.find(
        (student) => student.id === entry.student_id,
      );
      if (!student) return false;
      return (
        (batch ? student.batch === batch : true) &&
        (subject ? entry.subject === subject : true)
      );
    });
  }, [grades, students, batch, subject]);

  const onSubmit = async (values: GradeFormValues) => {
    const { error: insertError } = await addExam(values);
    if (insertError) {
      toastError(insertError.message);
      return;
    }

    toastSuccess("Grade added successfully.");
    setDialogOpen(false);
    reset({
      student_id: "",
      exam_name: "",
      subject: "",
      score: 0,
      max_score: 100,
      exam_date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Grades</h1>
          <p className="text-sm text-muted-foreground">
            Review exam results and add new score entries.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <select
              id="batch"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All batches</option>
              {batches.map((batchOption) => (
                <option key={batchOption} value={batchOption}>
                  {batchOption}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All subjects</option>
              {subjects.map((subjectOption) => (
                <option key={subjectOption} value={subjectOption}>
                  {subjectOption}
                </option>
              ))}
            </select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add result
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-lg">
              <DialogHeader>
                <DialogTitle>Add result</DialogTitle>
                <DialogDescription>
                  Enter exam details and save a new grade record.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="student_id">Student</Label>
                  <select
                    id="student_id"
                    {...register("student_id")}
                    className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Select student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} — {student.batch}
                      </option>
                    ))}
                  </select>
                  {errors.student_id ? (
                    <p className="text-sm text-destructive">
                      {errors.student_id.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exam_name">Exam name</Label>
                    <Input id="exam_name" {...register("exam_name")} />
                    {errors.exam_name ? (
                      <p className="text-sm text-destructive">
                        {errors.exam_name.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" {...register("subject")} />
                    {errors.subject ? (
                      <p className="text-sm text-destructive">
                        {errors.subject.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="score">Score</Label>
                    <Input id="score" type="number" {...register("score", { valueAsNumber: true })} />
                    {errors.score ? (
                      <p className="text-sm text-destructive">
                        {errors.score.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_score">Max score</Label>
                    <Input
                      id="max_score"
                      type="number"
                      {...register("max_score", { valueAsNumber: true })}
                    />
                    {errors.max_score ? (
                      <p className="text-sm text-destructive">
                        {errors.max_score.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam_date">Date</Label>
                    <Input id="exam_date" type="date" {...register("exam_date")} />
                    {errors.exam_date ? (
                      <p className="text-sm text-destructive">
                        {errors.exam_date.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save result"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Max</TableHead>
              <TableHead>%</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(loading || studentsLoading) &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 9 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && !studentsLoading && filteredGrades.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="px-2 py-6 text-center text-sm text-muted-foreground"
                >
                  No grade results match the selected filters.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading &&
              !studentsLoading &&
              filteredGrades.map((entry) => {
                const student = students.find(
                  (student) => student.id === entry.student_id,
                );
                const pct = entry.max_score
                  ? Math.round((entry.score / entry.max_score) * 100)
                  : 0;
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{student?.name ?? "Unknown"}</TableCell>
                    <TableCell>{student?.batch ?? "-"}</TableCell>
                    <TableCell>{entry.exam_name}</TableCell>
                    <TableCell>{entry.subject}</TableCell>
                    <TableCell>{entry.score}</TableCell>
                    <TableCell>{entry.max_score}</TableCell>
                    <TableCell>{pct}%</TableCell>
                    <TableCell>
                      {letterGrade(entry.score, entry.max_score)}
                    </TableCell>
                    <TableCell>
                      {new Date(entry.exam_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
