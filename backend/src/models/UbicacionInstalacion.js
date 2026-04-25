const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UbicacionInstalacion = sequelize.define(
    "UbicacionInstalacion",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      house_id: { type: DataTypes.INTEGER, allowNull: false },
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      descripcion: { type: DataTypes.STRING(255), allowNull: true },
      area: { type: DataTypes.STRING(80), allowNull: true },
      piso: { type: DataTypes.STRING(40), allowNull: true }
    },
    {
      tableName: "ubicacion_instalacion",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["house_id"] }]
    }
  );

  return UbicacionInstalacion;
};
