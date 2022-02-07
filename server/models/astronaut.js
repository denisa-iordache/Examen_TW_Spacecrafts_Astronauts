const sequelize = require("../sequelize");
const { DataTypes } = require("sequelize");

//Definire celei de-a doua entități - 0.3
const Astronaut = sequelize.define("astronaut", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nume: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
          len: 5
      }
    },
    rol: {
      type: DataTypes.ENUM({
        values: ['COMMANDER', 'PILOT']
      }),
      validate: {
        isIn: {
          args: [['COMMANDER', 'PILOT']],
            msg: "Valorile permise pentru acest camp sunt: COMMANDER, PILOT."
        }
      }
    }
  });
  
  module.exports = Astronaut;
  