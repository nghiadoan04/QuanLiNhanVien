const { Notification, Employee, User } = require('../models');
const transporter = require('../config/mail');

const toDTO = (notification) => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.is_read,
    createdAt: notification.created_at,
  };
};

const getUnreadCount = async (employeeId) => {
  return await Notification.count({
    where: { employee_id: employeeId, is_read: false },
  });
};

const getRecentNotifications = async (employeeId) => {
  const notifications = await Notification.findAll({
    where: { employee_id: employeeId },
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  return notifications.map(toDTO);
};

const getNotifications = async (employeeId) => {
  const notifications = await Notification.findAll({
    where: { employee_id: employeeId },
    order: [['created_at', 'DESC']],
  });

  return notifications.map(toDTO);
};

const markAsRead = async (notificationId) => {
  const notification = await Notification.findByPk(notificationId);
  if (!notification) {
    throw new Error('Thông báo không tồn tại');
  }

  notification.is_read = true;
  await notification.save();

  return toDTO(notification);
};

const createAndSendNotification = async (employeeId, title, message, type) => {
  const notification = await Notification.create({
    employee_id: employeeId,
    title,
    message,
    type,
    is_read: false,
    sent_via_email: false,
    created_at: new Date(),
  });

  // Try to send email
  try {
    const employee = await Employee.findByPk(employeeId, {
      include: [{ model: User, as: 'user', attributes: ['email'] }],
    });

    if (employee && employee.user && employee.user.email && process.env.MAIL_USERNAME) {
      await transporter.sendMail({
        from: process.env.MAIL_USERNAME,
        to: employee.user.email,
        subject: `[Staffio] ${title}`,
        text: message,
      });

      notification.sent_via_email = true;
      await notification.save();
    }
  } catch (err) {
    console.warn('Failed to send email notification:', err.message);
  }

  return toDTO(notification);
};

module.exports = {
  getUnreadCount,
  getRecentNotifications,
  getNotifications,
  markAsRead,
  createAndSendNotification,
};
