'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Player.init({
    full_name: DataTypes.STRING,
    date_of_birth: DataTypes.DATE,
    place_of_birth: DataTypes.STRING,
    nationality: DataTypes.STRING,
    height: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
    preferred_foot: DataTypes.STRING,
    team_id: DataTypes.INTEGER,
    jersey_number: DataTypes.INTEGER,
    position: DataTypes.STRING,
    status: DataTypes.STRING,
    bio: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Player',
  });
  return Player;
};