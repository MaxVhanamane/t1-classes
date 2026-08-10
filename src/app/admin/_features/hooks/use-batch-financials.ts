import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";
import { useQuery } from "@tanstack/react-query";

export interface BatchFinancialSummary {
    batch_id: string;
    batch_title: string;
    total_expected: number;
    total_collected: number;
    total_pending: number;
    total_overpaid: number;
    total_students: number;
    fully_paid_students: number;
    pending_students: number;
    missing_fee_plan_students: number;
}

export function useBatchFinancials() {
    const supabase = createBrowserSupabaseClient();

    return useQuery({
        queryKey: ["batch-financials"],
        queryFn: async () => {
            const { data, error } = await supabase.rpc("get_batch_financial_summary");
            if (error) throw error;
            return (data as BatchFinancialSummary[]) || [];
        },
    });
}
