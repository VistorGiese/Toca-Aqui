'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.rawSelect(
      'usuarios',
      { where: { email: 'admin@email.com' }, plain: true },
      ['id']
    );

    if (existing) {
      console.log('Admin já existe, pulando seeder.');
      return;
    }

    const hashedPassword = await bcrypt.hash('Senha@123', 10);

    await queryInterface.bulkInsert('usuarios', [{
      nome_completo: 'admin',
      email: 'admin@email.com',
      senha: hashedPassword,
      role: 'admin',
      email_verificado: true,
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@email.com' });
  },
};
