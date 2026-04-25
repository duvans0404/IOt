const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RespuestaComando = sequelize.define(
    "RespuestaComando",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      comando_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
      codigo_resultado: { type: DataTypes.STRING(40), allowNull: false },
      mensaje: { type: DataTypes.STRING(255), allowNull: true },
      payload: { type: DataTypes.JSON, allowNull: true },
      recibido_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    },
    {
      tableName: "respuestas_comando",
      timestamps: false,
      indexes: [{ fields: ["recibido_at"] }]
    }
  );

  return RespuestaComando;
};
