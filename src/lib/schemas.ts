import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(5, "Phone number is required"),
  batch: z.string().min(1, "Batch is required"),
  subject: z.string().min(1, "Subject is required"),
  monthly_fee: z.number().min(0, "Monthly fee must be at least 0"),
  joined_at: z.string().min(1, "Joined date is required"),
});

export const attendanceSchema = z.object({
  batch: z.string().min(1, "Select a batch"),
  date: z.string().min(1, "Select a date"),
});

export const gradeSchema = z.object({
  student_id: z.string().min(1, "Select a student"),
  exam_name: z.string().min(1, "Exam name is required"),
  subject: z.string().min(1, "Subject is required"),
  score: z.number().min(0, "Score must be at least 0"),
  max_score: z.number().min(1, "Max score must be at least 1"),
  exam_date: z.string().min(1, "Exam date is required"),
});

export const feePaymentSchema = z.object({
  student_id: z.string().min(1, "Select a student"),
  month: z.string().min(1, "Select a month"),
  amount: z.number().positive("Amount must be greater than 0"),
  payment_method: z.string().min(1, "Select a payment method"),
});

export const scheduleSchema = z
  .object({
    day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
    batch: z.string().min(1, "Batch is required"),
    subject: z.string().min(1, "Subject is required"),
    teacher: z.string().min(1, "Teacher is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
  })
  .superRefine((data, ctx) => {
    if (data.end_time <= data.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["end_time"],
      });
    }
  });
