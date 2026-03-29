const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
    },
    message: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM('SHIFT_ASSIGNED', 'SHIFT_REMINDER', 'SHIFT_CHANGE'),
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sent_via_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'notifications',
    timestamps: false,
  });

  return Notification;
};
