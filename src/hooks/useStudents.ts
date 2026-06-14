import type { PostgrestError } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Student } from "../types";

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError);
      setStudents([]);
    } else if (data) {
      setStudents(data);
    }

    setLoading(false);
    return { data: data ?? null, error: fetchError };
  }, []);

  const addStudent = useCallback(async (student: Omit<Student, "id">) => {
    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("students")
      .insert(student)
      .select()
      .single();

    if (insertError) {
      setError(insertError);
      setLoading(false);
      return { data: null, error: insertError };
    }

    if (data) {
      setStudents((prev) => [data, ...prev]);
    }

    setLoading(false);
    return { data, error: null };
  }, []);

  const updateStudent = useCallback(
    async (id: string, updates: Partial<Omit<Student, "id">>) => {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        setError(updateError);
        setLoading(false);
        return { data: null, error: updateError };
      }

      if (data) {
        setStudents((prev) =>
          prev.map((student) => (student.id === id ? data : student)),
        );
      }

      setLoading(false);
      return { data, error: null };
    },
    [],
  );

  const deleteStudent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError);
      setLoading(false);
      return { error: deleteError };
    }

    setStudents((prev) => prev.filter((student) => student.id !== id));
    setLoading(false);
    return { error: null };
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
  };
}
