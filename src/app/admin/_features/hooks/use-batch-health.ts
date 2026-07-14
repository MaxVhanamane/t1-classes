// hooks/use-batch-health.ts
import { createBrowserSupabaseClient } from '@/src/lib/supabase/supabase-client';
import { useQuery } from '@tanstack/react-query';

export interface BatchHealthData {
    id: string;
    batch_name: string;
    course_name: string;
    active_students: number;
    total_revenue: number;
}

export function useBatchHealth() {
    const supabase = createBrowserSupabaseClient();

    return useQuery({
        queryKey: ['batch-health'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_batch_health');
            if (error) throw error;
            return data as BatchHealthData[];
        },
    });
}
