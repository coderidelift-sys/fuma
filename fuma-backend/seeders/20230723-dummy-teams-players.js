module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('teams', [
      { team_id: 1, name: 'City FC', nickname: 'The Citizens', founded_year: 2000, country: 'England', city: 'London', stadium: 'City Arena', manager_id: 1, logo_url: '', tournament_id: null, createdAt: new Date(), updatedAt: new Date() },
      { team_id: 2, name: 'United SC', nickname: 'The Reds', founded_year: 1995, country: 'England', city: 'Manchester', stadium: 'United Stadium', manager_id: 1, logo_url: '', tournament_id: null, createdAt: new Date(), updatedAt: new Date() }
    ], {});
    await queryInterface.bulkInsert('players', [
      { player_id: 1, full_name: 'John Michael Smith', date_of_birth: '1998-06-15', place_of_birth: 'London', nationality: 'English', height: 1.85, weight: 78, preferred_foot: 'right', team_id: 1, jersey_number: 10, position: 'midfielder', status: 'active', bio: '', createdAt: new Date(), updatedAt: new Date() },
      { player_id: 2, full_name: 'David Brown', date_of_birth: '2000-01-20', place_of_birth: 'Manchester', nationality: 'English', height: 1.80, weight: 75, preferred_foot: 'left', team_id: 2, jersey_number: 7, position: 'forward', status: 'active', bio: '', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('players', null, {});
    await queryInterface.bulkDelete('teams', null, {});
  }
};
