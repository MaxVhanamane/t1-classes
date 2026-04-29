"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { LiveClassesResponse } from "../types/live-class.types";

interface Input {
    page: number;
    limit: number;
}

interface LiveClassBatchRow {
    batch_id: string;

    batches: {
        id: string;
        title: string;
    } | null;
}

interface LiveClassQueryRow {
    id: string;
    title: string;
    description: string | null;
    youtube_live_id: string;
    starts_at: string;
    ends_at: string;

    users: {
        full_name: string | null;
    } | null;

    live_class_batches:
    | LiveClassBatchRow[]
    | null;
}

export async function getLiveClasses({
    page,
    limit,
}: Input): Promise<LiveClassesResponse> {
    const supabase =
        await createServerSupabaseClient();

    const from =
        (page - 1) * limit;

    const to =
        from + limit - 1;

    const {
        data,
        count,
        error,
    } = await supabase
        .from("live_classes")
        .select(
            `
      id,
      title,
      description,
      youtube_live_id,
      starts_at,
      ends_at,

      users!live_classes_created_by_fkey(
        full_name
      ),

      live_class_batches(
        batch_id,
        batches(
          id,
          title
        )
      )
    `,
            {
                count: "exact",
            },
        )
        .order("starts_at", {
            ascending: false,
        })
        .range(from, to)
        .overrideTypes<
            LiveClassQueryRow[]
        >();

    if (error) {
        throw new Error(
            error.message,
        );
    }

    return {
        rows: (data ?? []).map(
            (item) => ({
                id: item.id,

                title:
                    item.title,

                description:
                    item.description,

                youtube_live_id:
                    item.youtube_live_id,

                starts_at:
                    item.starts_at,

                ends_at:
                    item.ends_at,

                batch_ids:
                    item.live_class_batches?.map(
                        (
                            batch,
                        ) =>
                            batch.batch_id,
                    ) ?? [],

                batches:
                    item.live_class_batches?.map(
                        (
                            batch,
                        ) => ({
                            id:
                                batch
                                    .batches
                                    ?.id ??
                                batch.batch_id,

                            title:
                                batch
                                    .batches
                                    ?.title ??
                                "Untitled Batch",
                        }),
                    ) ?? [],

                batches_count:
                    item
                        .live_class_batches
                        ?.length ??
                    0,

                created_by_name:
                    item.users
                        ?.full_name ??
                    null,
            }),
        ),

        total:
            count ?? 0,

        page,
        limit,
    };
}
