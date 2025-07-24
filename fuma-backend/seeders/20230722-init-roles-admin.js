module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      { role_id: 1, role_name: 'Admin' },
      { role_id: 2, role_name: 'Penyelenggara' },
      { role_id: 3, role_name: 'Panitia' },
      { role_id: 4, role_name: 'Manager Tim' }
    ], {});
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('users', [
      {
        user_id: 1,
        full_name: 'Super Admin',
        email: 'admin@fuma.com',
        whatsapp_number: '08123456789',
        password_hash: hash,
        role_id: 1,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'admin@fuma.com' }, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
}; 