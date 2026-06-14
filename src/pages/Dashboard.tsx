import { useEffect, useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Badge } from "../components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { useAttendance } from "../hooks/useAttendance";
import { useFees } from "../hooks/useFees";
import { useGrades } from "../hooks/useGrades";
import { useStudents } from "../hooks/useStudents";

function formatDate(date: Date) {
  const iso = date.toISOString();
  return iso.slice(0, 10);
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

function getGradeLabel(percentage: number) {
  if (percentage >= 95) return "A+";
  if (percentage >= 90) return "A";
  if (percentage >= 85) return "A-";
  if (percentage >= 80) return "B+";
  if (percentage >= 75) return "B";
  if (percentage >= 70) return "B-";
  if (percentage >= 65) return "C+";
  if (percentage >= 60) return "C";
  return "D";
}

export default function Dashboard() {
  const { students } = useStudents();
  const {
    attendance,
    fetchAttendance,
  } = useAttendance();
  const { fees, fetchFees } = useFees();
  const { grades, fetchGrades } = useGrades();

  useEffect(() => {
    const { startDate, endDate } = getMonthRange();
    fetchAttendance(startDate, endDate);
    fetchFees();
    fetchGrades();
  }, [fetchAttendance, fetchFees, fetchGrades]);

  const totalStudents = students.length;

  const attendanceSummary = useMemo(() => {
    if (attendance.length === 0 || students.length === 0)
      return { average: 0, chartData: [] };

    const studentMap = students.reduce<
      Record<string, { name: string; present: number; total: number }>
    >((acc, student) => {
      acc[student.id] = { name: student.name, present: 0, total: 0 };
      return acc;
    }, {});

    attendance.forEach((record) => {
      const row = studentMap[record.student_id];
      if (!row) return;
      row.total += 1;
      if (record.status === "present") row.present += 1;
    });

    const rows = Object.values(studentMap).map((entry) => ({
      name: entry.name,
      percentage:
        entry.total === 0 ? 0 : Math.round((entry.present / entry.total) * 100),
    }));

    const average =
      rows.reduce((sum, item) => sum + item.percentage, 0) /
      Math.max(rows.length, 1);

    return {
      average: Math.round(average),
      chartData: rows.sort((a, b) => b.percentage - a.percentage).slice(0, 8),
    };
  }, [attendance, students]);

  const feesSummary = useMemo(() => {
    const totalDue = fees.reduce((sum, fee) => sum + fee.amount_due, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + fee.amount_paid, 0);
    const collected = Math.min(totalPaid, totalDue);
    const due = Math.max(totalDue - totalPaid, 0);
    const paidCount = fees.filter(
      (fee) => fee.amount_paid >= fee.amount_due,
    ).length;
    const overdueCount = fees.filter((fee) => {
      const monthDate = new Date(`${fee.month}-01`);
      const now = new Date();
      return (
        fee.amount_paid < fee.amount_due &&
        monthDate < new Date(now.getFullYear(), now.getMonth(), 1)
      );
    }).length;

    return {
      totalDue,
      totalPaid,
      collected,
      due,
      chartData: [
        { name: "Collected", value: collected },
        { name: "Due", value: due },
      ],
      statusData: [
        { name: "Paid", value: paidCount },
        { name: "Overdue", value: overdueCount },
      ],
    };
  }, [fees]);

  const topGrade = useMemo(() => {
    if (grades.length === 0) return { label: "N/A", display: "No grades" };
    const highest = grades.reduce(
      (best, exam) => {
        const percentage = Math.round((exam.score / exam.max_score) * 100);
        return percentage > best.percentage ? { exam, percentage } : best;
      },
      {
        exam: grades[0],
        percentage: Math.round((grades[0].score / grades[0].max_score) * 100),
      },
    );
    return {
      label: getGradeLabel(highest.percentage),
      display: `${highest.percentage}% in ${highest.exam.subject}`,
    };
  }, [grades]);

  const recentStudents = useMemo(() => students.slice(0, 5), [students]);

  const donutColors = ["#22c55e", "#fb7185"];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-3xl border border-border bg-card p-6">
          <CardHeader>
            <CardTitle>Total students</CardTitle>
            <CardDescription>{totalStudents} enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mt-4 text-4xl font-semibold">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card p-6">
          <CardHeader>
            <CardTitle>Average attendance</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mt-4 text-4xl font-semibold">
              {attendanceSummary.average}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Attendance calculated from recorded sessions.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card p-6">
          <CardHeader>
            <CardTitle>Fees collected</CardTitle>
            <CardDescription>Collected vs due</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mt-4 text-4xl font-semibold">
              ${feesSummary.collected.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Due ${feesSummary.due.toFixed(2)} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card p-6">
          <CardHeader>
            <CardTitle>Top grade</CardTitle>
            <CardDescription>Best exam result</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mt-4 text-4xl font-semibold">{topGrade.label}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {topGrade.display}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl border border-border bg-card p-6">
          <CardHeader>
            <div>
              <CardTitle>Attendance per student</CardTitle>
              <CardDescription>Monthly attendance percentages</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceSummary.chartData}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.25)"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar
                    dataKey="percentage"
                    fill="#2563eb"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card p-6">
          <CardHeader>
            <div>
              <CardTitle>Fee status</CardTitle>
              <CardDescription>Payment balance across records</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-[320px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feesSummary.statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {feesSummary.statusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={donutColors[index % donutColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} records`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {feesSummary.statusData.map((slice, index) => (
                <div
                  key={slice.name}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <span className="font-medium">{slice.name}</span>
                  <Badge
                    variant={
                      slice.name === "Paid" ? "secondary" : "destructive"
                    }
                  >
                    {slice.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 rounded-3xl border border-border bg-card p-6">
          <CardHeader>
            <CardTitle>Recent students</CardTitle>
            <CardDescription>Latest enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No students available yet.
                </p>
              ) : (
                recentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-2 rounded-3xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.subject} • {student.batch}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p>{new Date(student.joined_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card p-6">
          <CardHeader>
            <CardTitle>Fee balance</CardTitle>
            <CardDescription>Financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Total due</p>
                <p className="mt-2 text-2xl font-semibold">
                  ${feesSummary.totalDue.toFixed(2)}
                </p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Total paid</p>
                <p className="mt-2 text-2xl font-semibold">
                  ${feesSummary.totalPaid.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
