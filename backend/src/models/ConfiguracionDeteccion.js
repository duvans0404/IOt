const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ConfiguracionDeteccion = sequelize.define(
    "ConfiguracionDeteccion",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      device_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      umbral_flow_lmin: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 2.0 },
      ventana_minutos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
      umbral_presion_min_kpa: { type: DataTypes.FLOAT, allowNull: true },
      umbral_presion_max_kpa: { type: DataTypes.FLOAT, allowNull: true },
      auto_cierre_valvula: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      notificar_email: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      updated_by_user_id: { type: DataTypes.INTEGER, allowNull: true }
    },
    {
      tableName: "configuracion_deteccion",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ unique: true, fields: ["device_id"] }]
    }
  );

  return ConfiguracionDeteccion;
};
