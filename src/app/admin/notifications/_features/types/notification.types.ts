export const notificationTypes = [
    "announcement",
    "reminder",
    "test",
    "system",
    "batch",
] as const;

export type NotificationType = (typeof notificationTypes)[number];
