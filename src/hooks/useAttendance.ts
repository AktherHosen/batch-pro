import type { PostgrestError } from "@supabase/supabase-js";
import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Attendance } from "../types";

export function useAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchAttendance = useCallback(
    async (startDate: string, endDate: string) => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (fetchError) {
        setError(fetchError);
        setAttendance([]);
      } else if (data) {
        setAttendance(data);
      }

      setLoading(false);
      return { data: data ?? null, error: fetchError };
    },
    [],
  );

  const upsertAttendance = useCallback(
    async (records: Array<Omit<Attendance, "id">>) => {
      setLoading(true);
      setError(null);

      const { data, error: upsertError } = await supabase
        .from("attendance")
        .upsert(records)
        .select();

      if (upsertError) {
        setError(upsertError);
      } else if (data) {
        setAttendance(data);
      }

      setLoading(false);
      return { data: data ?? null, error: upsertError };
    },
    [],
  );

  return {
    attendance,
    loading,
    error,
    fetchAttendance,
    upsertAttendance,
  };
}
