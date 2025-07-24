'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('player_match_stats', {
      stat_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      match_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'matches', key: 'match_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'player_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      goals: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      assists: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      yellow_cards: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      red_cards: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      minutes_played: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('player_match_stats');
  }
};