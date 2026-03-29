const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shift = sequelize.define('Shift', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    max_employees: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    created_by: {
      type: DataTypes.BIGINT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'shifts',
    timestamps: false,
  });

  return Shift;
};
