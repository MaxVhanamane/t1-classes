      batch:batch_id (
        id,
        title,
        mode,
        schedule,
        status,
        is_active
      )
    `)
        .eq("user_id", userId)
        .eq("status", "ongoing")
        .lte("access_starts_at", nowIso)
        .or(`access_ends_at.is.null,access_ends_at.gte.${nowIso}`)
        .order("created_at", { ascending: false })