import type { PostgrestError } from "@supabase/supabase-js";
import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ScheduleItem } from "../types";

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("schedule")
      .select("*")
      .order("day", { ascending: true })
      .order("start_time", { ascending: true });

    if (fetchError) {
      setError(fetchError);
      setSchedule([]);
    } else if (data) {
      setSchedule(data);
    }

    setLoading(false);
    return { data: data ?? null, error: fetchError };
  }, []);

  const addClass = useCallback(async (item: Omit<ScheduleItem, "id">) => {
    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("schedule")
      .insert(item)
      .select()
      .single();

    if (insertError) {
      setError(insertError);
      setLoading(false);
      return { data: null, error: insertError };
    }

    if (data) {
      setSchedule((prev) => [...prev, data]);
    }

    setLoading(false);
    return { data, error: null };
  }, []);

  return {
    schedule,
    loading,
    error,
    fetchSchedule,
    addClass,
  };
}
