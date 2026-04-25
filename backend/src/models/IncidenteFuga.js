const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const IncidenteFuga = sequelize.define(
    "IncidenteFuga",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      device_id: { type: DataTypes.INTEGER, allowNull: false },
      detected_at: { type: DataTypes.DATE, allowNull: false },
      ended_at: { type: DataTypes.DATE, allowNull: true },
      flow_promedio_lmin: { type: DataTypes.FLOAT, allowNull: true },
      duracion_minutos: { type: DataTypes.INTEGER, allowNull: true },
      volumen_estimado_l: { type: DataTypes.FLOAT, allowNull: true },
      estado: {
        type: DataTypes.ENUM("ABIERTO", "CONFIRMADO", "FALSO_POSITIVO", "CERRADO"),
        allowNull: false,
        defaultValue: "ABIERTO"
      },
      umbral_flow_lmin: { type: DataTypes.FLOAT, allowNull: true },
      ventana_minutos: { type: DataTypes.INTEGER, allowNull: true },
      resuelto_por_user_id: { type: DataTypes.INTEGER, allowNull: true },
      resuelto_at: { type: DataTypes.DATE, allowNull: true },
      observaciones: { type: DataTypes.TEXT, allowNull: true }
    },
    {
      tableName: "incidente_fuga",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["device_id", "detected_at"] },
        { fields: ["estado"] }
      ]
    }
  );

  return IncidenteFuga;
};
