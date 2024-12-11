// adminNotificationController.js
const AdminNotification = require('../models/adminNotificationModel');

const AdminNotificationController = {
    createNotification: async (req, res) => {
        try {
            const notificationId = await AdminNotification.create(req.body);
            res.status(201).json({ success: true, notificationId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAllNotifications: async (req, res) => {
        try {
            const notifications = await AdminNotification.getAll();
            res.status(200).json({ success: true, notifications });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markNotificationAsRead: async (req, res) => {
        try {
            const { notificationId } = req.params;
            await AdminNotification.markAsRead(notificationId);
            res.status(200).json({ success: true, message: 'Notification marked as read.' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = AdminNotificationController;
