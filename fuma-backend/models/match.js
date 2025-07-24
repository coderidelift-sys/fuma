'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Match.init({
    tournament_id: DataTypes.INTEGER,
    home_team_id: DataTypes.INTEGER,
    away_team_id: DataTypes.INTEGER,
    match_date: DataTypes.DATE,
    stadium: DataTypes.STRING,
    status: DataTypes.STRING,
    home_score: DataTypes.INTEGER,
    away_score: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Match',
  });
  return Match;
};