'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('perfis_estabelecimentos');

    if (!tableDescription.latitude) {
      await queryInterface.addColumn('perfis_estabelecimentos', 'latitude', {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      });
    }

    if (!tableDescription.longitude) {
      await queryInterface.addColumn('perfis_estabelecimentos', 'longitude', {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      });
    }

    if (!tableDescription.shows_realizados) {
      await queryInterface.addColumn('perfis_estabelecimentos', 'shows_realizados', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableDescription.nota_media) {
      await queryInterface.addColumn('perfis_estabelecimentos', 'nota_media', {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('perfis_estabelecimentos', 'latitude');
    await queryInterface.removeColumn('perfis_estabelecimentos', 'longitude');
    await queryInterface.removeColumn('perfis_estabelecimentos', 'shows_realizados');
    await queryInterface.removeColumn('perfis_estabelecimentos', 'nota_media');
  },
};
