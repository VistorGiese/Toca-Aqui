'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendamentos', 'cache_minimo', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('agendamentos', 'cache_maximo', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agendamentos', 'cache_minimo');
    await queryInterface.removeColumn('agendamentos', 'cache_maximo');
  },
};
