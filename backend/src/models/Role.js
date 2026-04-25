const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      descripcion: { type: DataTypes.STRING(255), allowNull: true }
    },
    {
      tableName: "roles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ unique: true, fields: ["code"] }]
    }
  );

  return Role;
};
