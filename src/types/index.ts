export type ScheduleItem = {
  id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  subject: string;
  teacher: string;
  start_time: string;
  end_time: string;
  batch: string;
};

export type Student = {
  id: string;
  name: string;
  phone: string;
  batch: string;
  subject: string;
  monthly_fee: number;
  joined_at: string;
};

export type Attendance = {
  id: string;
  student_id: string;
  date: string;
  status: "present" | "absent";
};

export type Exam = {
  id: string;
  student_id: string;
  exam_name: string;
  subject: string;
  score: number;
  max_score: number;
  exam_date: string;
};

export type Fee = {
  id: string;
  student_id: string;
  month: string;
  amount_due: number;
  amount_paid: number;
  payment_method: string;
};
