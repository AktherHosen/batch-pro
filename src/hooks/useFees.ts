import type { PostgrestError } from "@supabase/supabase-js";
import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Fee } from "../types";

export function useFees() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("fees")
      .select("*")
      .order("month", { ascending: false });

    if (fetchError) {
      setError(fetchError);
      setFees([]);
    } else if (data) {
      setFees(data);
    }

    setLoading(false);
    return { data: data ?? null, error: fetchError };
  }, []);

  const recordPayment = useCallback(
    async (feeId: string, amountPaid: number, payment_method: string) => {
      setLoading(true);
      setError(null);

      const { data: existingFee, error: fetchError } = await supabase
        .from("fees")
        .select("*")
        .eq("id", feeId)
        .single();

      if (fetchError || !existingFee) {
        setError(fetchError);
        setLoading(false);
        return { data: null, error: fetchError };
      }

      const { data, error: updateError } = await supabase
        .from("fees")
        .update({
          amount_paid: existingFee.amount_paid + amountPaid,
          payment_method,
        })
        .eq("id", feeId)
        .select()
        .single();

      if (updateError) {
        setError(updateError);
        setLoading(false);
        return { data: null, error: updateError };
      }

      if (data) {
        setFees((prev) => prev.map((fee) => (fee.id === feeId ? data : fee)));
      }

      setLoading(false);
      return { data, error: null };
    },
    [],
  );

  const updateFee = useCallback(
    async (id: string, updates: Partial<Omit<Fee, "id">>) => {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("fees")
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
        setFees((prev) => prev.map((fee) => (fee.id === id ? data : fee)));
      }

      setLoading(false);
      return { data, error: null };
    },
    [],
  );

  return {
    fees,
    loading,
    error,
    fetchFees,
    recordPayment,
    updateFee,
  };
}
