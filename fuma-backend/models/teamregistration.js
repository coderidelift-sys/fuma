'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TeamRegistration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TeamRegistration.init({
    team_id: DataTypes.INTEGER,
    tournament_id: DataTypes.INTEGER,
    manager_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    registered_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'TeamRegistration',
  });
  return TeamRegistration;
};