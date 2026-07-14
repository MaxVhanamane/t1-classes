// hooks/use-dashboard-kpis.ts
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";
import { useQuery } from "@tanstack/react-query";

export interface DashboardKPIs {
  financials: {
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
    totalOverpaid: number;
  };
  academics: {
    activeEnrollments: number;
    activeBatches: number;
    activeCourses: number;
  };
  users: {
    total: number;
    roles: { admins: number; teachers: number; students: number };
    statuses: {
      active: number;
      inactive: number;
      blocked: number;
      invited: number;
    };
  };
}

export function useDashboardKPIs() {
  const supabase = createBrowserSupabaseClient();

  return useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_kpis");
      if (error) throw error;
      return data as DashboardKPIs;
    },
  });
}
