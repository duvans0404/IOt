const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EstadoSistema = sequelize.define(
    "EstadoSistema",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      device_id: { type: DataTypes.INTEGER, allowNull: false },
      ts: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      estado: {
        type: DataTypes.ENUM("NORMAL", "ALERTA", "FUGA", "MANTENIMIENTO", "OFFLINE"),
        allowNull: false,
        defaultValue: "NORMAL"
      },
      motivo: { type: DataTypes.STRING(180), allowNull: true },
      metadata: { type: DataTypes.JSON, allowNull: true }
    },
    {
      tableName: "estado_sistema",
      timestamps: false,
      indexes: [
        { fields: ["device_id", "ts"] },
        { fields: ["estado"] }
      ]
    }
  );

  return EstadoSistema;
};
