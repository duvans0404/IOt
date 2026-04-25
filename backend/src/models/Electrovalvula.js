const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Electrovalvula = sequelize.define(
    "Electrovalvula",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      device_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      estado: {
        type: DataTypes.ENUM("ABIERTA", "CERRADA", "DESCONOCIDO"),
        allowNull: false,
        defaultValue: "DESCONOCIDO"
      },
      modo: {
        type: DataTypes.ENUM("AUTO", "MANUAL", "BLOQUEADA"),
        allowNull: false,
        defaultValue: "AUTO"
      },
      ultima_accion_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
      tableName: "electrovalvulas",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ unique: true, fields: ["device_id"] }]
    }
  );

  return Electrovalvula;
};
