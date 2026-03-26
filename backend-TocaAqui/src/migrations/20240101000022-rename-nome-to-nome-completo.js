'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('usuarios', 'nome', 'nome_completo');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('usuarios', 'nome_completo', 'nome');
  },
};
