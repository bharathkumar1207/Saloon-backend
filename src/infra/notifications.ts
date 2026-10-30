import { query, queryOne } from "../../db/db.config";
import type { Notification, NotificationType } from "../../db/schema";

export function listNotifications(userId?: string): Promise<Notification[]> {
  if (userId) {
    // Includes broadcast notifications (user_id IS NULL) alongside this user's own.
    return query<Notification>(
      "SELECT * FROM notifications WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC",
      [userId],
    );
  }
  return query<Notification>("SELECT * FROM notifications ORDER BY created_at DESC");
}

export type CreateNotificationInput = {
  userId?: string | null;
  type?: NotificationType;
  title: string;
  message: string;
};

export async function createNotification(
  input: CreateNotificationInput,
): Promise<Notification> {
  const notification = await queryOne<Notification>(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.userId ?? null, input.type ?? "system", input.title, input.message],
  );
  if (!notification) throw new Error("Failed to create notification");
  return notification;
}

export async function markNotificationRead(id: string): Promise<Notification | null> {
  return queryOne<Notification>(
    "UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *",
    [id],
  );
}

export async function deleteNotification(id: string): Promise<boolean> {
  const rows = await query("DELETE FROM notifications WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}
