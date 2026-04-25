const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AccionValvula = sequelize.define(
    "AccionValvula",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      valvula_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      tipo: {
        type: DataTypes.ENUM("ABRIR", "CERRAR", "RESETEAR", "CAMBIAR_MODO"),
        allowNull: false
      },
      origen: {
        type: DataTypes.ENUM("MANUAL", "AUTO_FUGA", "PROGRAMADO", "REMOTO"),
        allowNull: false,
        defaultValue: "MANUAL"
      },
      estado_resultado: {
        type: DataTypes.ENUM("PENDIENTE", "EXITOSO", "ERROR"),
        allowNull: false,
        defaultValue: "PENDIENTE"
      },
      ts: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      detalle: { type: DataTypes.STRING(255), allowNull: true }
    },
    {
      tableName: "acciones_valvula",
      timestamps: false,
      indexes: [
        { fields: ["valvula_id", "ts"] },
        { fields: ["tipo"] }
      ]
    }
  );

  return AccionValvula;
};
