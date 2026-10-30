import * as notificationsInfra from "../infra/notifications";

export const listNotifications = notificationsInfra.listNotifications;
export const markNotificationRead = notificationsInfra.markNotificationRead;
export const deleteNotification = notificationsInfra.deleteNotification;

export const notify = notificationsInfra.createNotification;
