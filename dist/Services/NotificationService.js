"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Socket_1 = require("../Config/Socket");
const NotificationModel_1 = require("../Models/NotificationModel");
const CustomError_1 = require("../Utils/CustomError");
class NotificationService {
    static async addNotification(userId, message) {
        try {
            const notification = await NotificationModel_1.Notification.create({ userId, message });
            Socket_1.io.to(userId).emit("newNotification", { notification });
            console.log(`Real-time: Notification sent to user ${userId}: ${message}`);
        }
        catch (error) {
            console.error("Failed to add notification:", error);
        }
    }
    static async getUnreadNotifications(userId) {
        try {
            const unreadNotifications = await NotificationModel_1.Notification.find({
                userId: userId,
                isRead: false
            }).sort({ createdAt: -1 });
            console.log("unreadNotifications: ", unreadNotifications);
            console.log(`Fetched ${unreadNotifications.length} unread notifications for user ${userId}`);
            return unreadNotifications;
        }
        catch (error) {
            console.error("Failed to fetch unread notifications:", error);
            throw error;
        }
    }
    static async markNotificationAsRead(userId, notificationId) {
        try {
            const notification = await NotificationModel_1.Notification.findById(notificationId);
            if (!notification) {
                throw new CustomError_1.CustomError("Notification not found", 404);
            }
            if (notification.userId.toString() !== userId.toString()) {
                throw new CustomError_1.CustomError("Not authorized", 401);
            }
            notification.isRead = true;
            await notification.save();
            Socket_1.io.to(userId).emit("updateNotifications", {
                type: "markAsRead",
                notificationId,
            });
            console.log(`Real-time: Notification marked as read for user ${userId}`);
            return "Notification marked as read";
        }
        catch (error) {
            console.error("Failed to mark notification as read:", error);
            throw error;
        }
    }
    static async deleteAllNotifications(userId) {
        try {
            await NotificationModel_1.Notification.deleteMany({ userId });
            Socket_1.io.to(userId).emit("updateNotifications", {
                type: "clearAll",
            });
            console.log(`Real-time: All notifications cleared for user ${userId}`);
        }
        catch (error) {
            console.error("Failed to delete notifications:", error);
            throw error;
        }
    }
}
exports.default = NotificationService;
