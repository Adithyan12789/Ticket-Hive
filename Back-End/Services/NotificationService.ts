import { io } from "../Config/Socket";
import { Notification } from "../Models/NotificationModel";
import { CustomError } from "../Utils/CustomError";

class NotificationService {
  public static async addNotification(
    userId: string,
    message: string
  ): Promise<void> {
    try {
      const notification = await Notification.create({ userId, message });
      io.to(userId).emit("newNotification", { notification });
      console.log(`Real-time: Notification sent to user ${userId}: ${message}`);
    } catch (error) {
      console.error("Failed to add notification:", error);
    }
  }

  
  public static async getUnreadNotifications(userId: string): Promise<any> {
    try {
      const unreadNotifications = await Notification.find({ 
        userId: userId, 
        isRead: false 
      }).sort({ createdAt: -1 });

      console.log("unreadNotifications: ", unreadNotifications);
      
      console.log(`Fetched ${unreadNotifications.length} unread notifications for user ${userId}`);
      return unreadNotifications;
       
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
      throw error;
    }
  }

  public static async markNotificationAsRead(
    userId: string,
    notificationId: string
  ): Promise<string> {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new CustomError("Notification not found", 404);
      }
      if (notification.userId.toString() !== userId.toString()) {
        throw new CustomError("Not authorized", 401);
      }

      notification.isRead = true;
      await notification.save();

      io.to(userId).emit("updateNotifications", {
        type: "markAsRead",
        notificationId,
      });

      console.log(`Real-time: Notification marked as read for user ${userId}`);
      return "Notification marked as read";
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  public static async deleteAllNotifications(userId: string): Promise<void> {
    try {
      await Notification.deleteMany({ userId });

      io.to(userId).emit("updateNotifications", {
        type: "clearAll",
      });

      console.log(`Real-time: All notifications cleared for user ${userId}`);
    } catch (error) {
      console.error("Failed to delete notifications:", error);
      throw error;
    }
  }

}

export default NotificationService;
