const { Sequelize } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./sqlite/db_examen.db",
  define: {
    timestamps: false,
  },
});

module.exports = sequelize;