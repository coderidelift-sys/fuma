'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('matches', {
      match_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tournament_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tournaments', key: 'tournament_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      home_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'teams', key: 'team_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      away_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'teams', key: 'team_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      match_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      stadium: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'scheduled'
      },
      home_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      away_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('matches');
  }
};