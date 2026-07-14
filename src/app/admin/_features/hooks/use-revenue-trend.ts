// hooks/use-revenue-trend.ts
import { createBrowserSupabaseClient } from '@/src/lib/supabase/supabase-client';
import { useQuery } from '@tanstack/react-query';

export interface RevenueTrendData {
    month: string;
    full_date: string;
    gross_revenue: number;
    refunds: number;
    net_revenue: number;
}

export function useRevenueTrend(monthsBack = 6) {
    const supabase = createBrowserSupabaseClient();

    return useQuery({
        queryKey: ['revenue-trend', monthsBack],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_revenue_trend', {
                months_back: monthsBack
            });

            if (error) throw error;
            return data as RevenueTrendData[];
        },
    });
}
