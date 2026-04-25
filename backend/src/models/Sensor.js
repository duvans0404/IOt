const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Sensor = sequelize.define(
    "Sensor",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      device_id: { type: DataTypes.INTEGER, allowNull: false },
      ubicacion_id: { type: DataTypes.INTEGER, allowNull: true },
      tipo: {
        type: DataTypes.ENUM("caudal", "presion", "valvula", "temperatura", "otro"),
        allowNull: false,
        defaultValue: "caudal"
      },
      modelo: { type: DataTypes.STRING(80), allowNull: true },
      unidad: { type: DataTypes.STRING(20), allowNull: true },
      rango_min: { type: DataTypes.FLOAT, allowNull: true },
      rango_max: { type: DataTypes.FLOAT, allowNull: true },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    {
      tableName: "sensores",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["device_id"] }, { fields: ["tipo"] }]
    }
  );

  return Sensor;
};
