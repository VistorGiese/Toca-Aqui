'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('perfis_estabelecimentos', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('perfis_estabelecimentos', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('perfis_estabelecimentos', 'latitude');
    await queryInterface.removeColumn('perfis_estabelecimentos', 'longitude');
  },
};
