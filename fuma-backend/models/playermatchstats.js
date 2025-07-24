'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlayerMatchStats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PlayerMatchStats.init({
    match_id: DataTypes.INTEGER,
    player_id: DataTypes.INTEGER,
    goals: DataTypes.INTEGER,
    assists: DataTypes.INTEGER,
    yellow_cards: DataTypes.INTEGER,
    red_cards: DataTypes.INTEGER,
    minutes_played: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PlayerMatchStats',
  });
  return PlayerMatchStats;
};