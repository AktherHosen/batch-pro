import type { PostgrestError } from "@supabase/supabase-js";
import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Exam } from "../types";

export function useGrades() {
  const [grades, setGrades] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchGrades = useCallback(async (studentId?: string) => {
    setLoading(true);
    setError(null);

    let query = supabase.from("exams").select("*").order("exam_date", {
      ascending: false,
    });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError);
      setGrades([]);
    } else if (data) {
      setGrades(data);
    }

    setLoading(false);
    return { data: data ?? null, error: fetchError };
  }, []);

  const addExam = useCallback(async (exam: Omit<Exam, "id">) => {
    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("exams")
      .insert(exam)
      .select()
      .single();

    if (insertError) {
      setError(insertError);
      setLoading(false);
      return { data: null, error: insertError };
    }

    if (data) {
      setGrades((prev) => [data, ...prev]);
    }

    setLoading(false);
    return { data, error: null };
  }, []);

  return {
    grades,
    loading,
    error,
    fetchGrades,
    addExam,
  };
}
