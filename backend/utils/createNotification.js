
import Notification from "../models/Notification.js";

export default async function createNotification({
  title,
  message,
  type = "info",
  category = "general",
  createdBy = null,
  metadata = {},
  targetRole = "all",
  targetUser = null,
  relatedModel = null,
  relatedId = null,
}) {
  return Notification.create({
    title,
    message,
    type,
    category,
    createdBy,
    metadata,
    targetRole,
    targetUser,
    relatedModel,
    relatedId,
  });
}
