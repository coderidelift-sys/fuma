'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Team.init({
    team_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    nickname: DataTypes.STRING,
    founded_year: DataTypes.INTEGER,
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    stadium: DataTypes.STRING,
    manager_id: DataTypes.INTEGER,
    logo_url: DataTypes.STRING,
    tournament_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};