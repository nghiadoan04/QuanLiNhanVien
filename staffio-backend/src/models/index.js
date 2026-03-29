const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Employee = require('./Employee')(sequelize);
const Shift = require('./Shift')(sequelize);
const ShiftRegistration = require('./ShiftRegistration')(sequelize);
const Attendance = require('./Attendance')(sequelize);
const Notification = require('./Notification')(sequelize);

// Associations
User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Shift.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Shift.hasMany(ShiftRegistration, { foreignKey: 'shift_id', as: 'registrations' });
ShiftRegistration.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });

Employee.hasMany(ShiftRegistration, { foreignKey: 'employee_id', as: 'registrations' });
ShiftRegistration.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendances' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

Shift.hasMany(Attendance, { foreignKey: 'shift_id', as: 'attendances' });
Attendance.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });

Employee.hasMany(Notification, { foreignKey: 'employee_id', as: 'notifications' });
Notification.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

module.exports = {
  sequelize,
  User,
  Employee,
  Shift,
  ShiftRegistration,
  Attendance,
  Notification,
};
