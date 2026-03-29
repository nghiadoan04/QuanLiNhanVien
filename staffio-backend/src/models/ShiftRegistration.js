const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ShiftRegistration = sequelize.define('ShiftRegistration', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    shift_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    registered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    approved_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'shift_registrations',
    timestamps: false,
  });

  return ShiftRegistration;
};
