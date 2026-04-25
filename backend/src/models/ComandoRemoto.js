const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ComandoRemoto = sequelize.define(
    "ComandoRemoto",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      device_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      tipo: {
        type: DataTypes.ENUM(
          "CERRAR_VALVULA",
          "ABRIR_VALVULA",
          "ACTUALIZAR_CONFIG",
          "REINICIAR",
          "SOLICITAR_ESTADO",
          "OTRO"
        ),
        allowNull: false
      },
      payload: { type: DataTypes.JSON, allowNull: true },
      estado: {
        type: DataTypes.ENUM("PENDIENTE", "ENVIADO", "EJECUTADO", "ERROR", "EXPIRADO"),
        allowNull: false,
        defaultValue: "PENDIENTE"
      },
      prioridad: {
        type: DataTypes.ENUM("BAJA", "NORMAL", "ALTA", "CRITICA"),
        allowNull: false,
        defaultValue: "NORMAL"
      },
      sent_at: { type: DataTypes.DATE, allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
      tableName: "comandos_remotos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["device_id", "estado"] },
        { fields: ["created_at"] },
        { fields: ["tipo"] }
      ]
    }
  );

  return ComandoRemoto;
};
