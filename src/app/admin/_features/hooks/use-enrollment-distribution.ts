// hooks/use-enrollment-distribution.ts
import { createBrowserSupabaseClient } from '@/src/lib/supabase/supabase-client';
import { useQuery } from '@tanstack/react-query';

export interface ProgramDistribution {
    name: string;
    students: number;
}

export interface EnrollmentDistributionData {
    courses: ProgramDistribution[];
    batches: ProgramDistribution[];
}

export function useEnrollmentDistribution() {
    const supabase = createBrowserSupabaseClient();

    return useQuery({
        queryKey: ['enrollment-distribution'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_enrollment_distribution');
            if (error) throw error;
            return data as EnrollmentDistributionData;
        },
    });
}
