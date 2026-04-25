const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserRole = sequelize.define(
    "UserRole",
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
      role_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
      assigned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    },
    {
      tableName: "user_roles",
      timestamps: false,
      indexes: [{ fields: ["role_id"] }]
    }
  );

  return UserRole;
};
