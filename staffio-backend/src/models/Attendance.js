const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    shift_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    check_in: {
      type: DataTypes.DATE,
    },
    check_out: {
      type: DataTypes.DATE,
    },
    qr_token: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('CHECKED_IN', 'CHECKED_OUT', 'MISSED'),
      defaultValue: 'CHECKED_IN',
    },
    total_hours: {
      type: DataTypes.DECIMAL(5, 2),
    },
  }, {
    tableName: 'attendances',
    timestamps: false,
  });

  return Attendance;
};
