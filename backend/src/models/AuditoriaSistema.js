const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AuditoriaSistema = sequelize.define(
    "AuditoriaSistema",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      entidad: { type: DataTypes.STRING(80), allowNull: false },
      entidad_id: { type: DataTypes.STRING(80), allowNull: true },
      accion: { type: DataTypes.STRING(80), allowNull: false },
      detalle: { type: DataTypes.JSON, allowNull: true },
      ip: { type: DataTypes.STRING(64), allowNull: true },
      user_agent: { type: DataTypes.STRING(255), allowNull: true },
      ts: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    },
    {
      tableName: "auditoria_sistema",
      timestamps: false,
      indexes: [
        { fields: ["entidad", "entidad_id"] },
        { fields: ["ts"] },
        { fields: ["user_id"] }
      ]
    }
  );

  return AuditoriaSistema;
};
