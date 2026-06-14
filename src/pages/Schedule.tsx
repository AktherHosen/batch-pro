import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "../lib/toast";
import { scheduleSchema } from "../lib/schemas";
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
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useSchedule } from "../hooks/useSchedule";

const dayTabs = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export default function Schedule() {
  const { schedule, loading, error, fetchSchedule, addClass } = useSchedule();
  const [activeDay, setActiveDay] = useState<(typeof dayTabs)[number]>("Mon");
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      day: "Mon",
      batch: "",
      subject: "",
      teacher: "",
      start_time: "08:00",
      end_time: "09:00",
    },
  });

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const scheduleForDay = useMemo(
    () => schedule.filter((item) => item.day === activeDay),
    [schedule, activeDay],
  );

  const onSubmit = async (values: ScheduleFormValues) => {
    const { error: insertError } = await addClass(values);
    if (insertError) {
      toastError(insertError.message);
      return;
    }

    toastSuccess("Class added successfully.");
    reset();
    setDialogOpen(false);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Manage weekly class blocks, subjects, and teacher assignments.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add class
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-lg">
            <DialogHeader>
              <DialogTitle>Add schedule item</DialogTitle>
              <DialogDescription>
                Create a class entry for the weekly schedule.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <select
                    id="day"
                    {...register("day")}
                    className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {dayTabs.map((tab) => (
                      <option key={tab} value={tab}>
                        {tab}
                      </option>
                    ))}
                  </select>
                  {errors.day ? (
                    <p className="text-sm text-destructive">
                      {errors.day.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Input id="batch" {...register("batch")} placeholder="Batch name" />
                  {errors.batch ? (
                    <p className="text-sm text-destructive">
                      {errors.batch.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" {...register("subject")} placeholder="Subject title" />
                  {errors.subject ? (
                    <p className="text-sm text-destructive">
                      {errors.subject.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Input id="teacher" {...register("teacher")} placeholder="Instructor name" />
                  {errors.teacher ? (
                    <p className="text-sm text-destructive">
                      {errors.teacher.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start time</Label>
                  <Input id="start_time" type="time" {...register("start_time")} />
                  {errors.start_time ? (
                    <p className="text-sm text-destructive">
                      {errors.start_time.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End time</Label>
                  <Input id="end_time" type="time" {...register("end_time")} />
                  {errors.end_time ? (
                    <p className="text-sm text-destructive">
                      {errors.end_time.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add class"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Tabs
          value={activeDay}
          onValueChange={(value) => setActiveDay(value as typeof activeDay)}
        >
          <TabsList className="grid grid-cols-6 gap-2">
            {dayTabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="rounded-lg">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading schedule...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive">
            {error.message}
          </div>
        ) : scheduleForDay.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No classes scheduled for {activeDay}.
          </div>
        ) : (
          <div className="grid gap-4">
            {scheduleForDay.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {item.batch}
                    </p>
                    <h2 className="text-lg font-semibold">{item.subject}</h2>
                    <p className="text-sm text-muted-foreground">
                      Taught by {item.teacher}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {item.start_time} - {item.end_time}
                    </Badge>
                    <Badge>{item.day}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
