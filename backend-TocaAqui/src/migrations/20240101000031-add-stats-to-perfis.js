'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // perfis_artistas
    await queryInterface.addColumn('perfis_artistas', 'shows_realizados', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('perfis_artistas', 'nota_media', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
    });

    // perfis_estabelecimentos
    await queryInterface.addColumn('perfis_estabelecimentos', 'shows_realizados', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('perfis_estabelecimentos', 'nota_media', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('perfis_artistas', 'shows_realizados');
    await queryInterface.removeColumn('perfis_artistas', 'nota_media');
    await queryInterface.removeColumn('perfis_estabelecimentos', 'shows_realizados');
    await queryInterface.removeColumn('perfis_estabelecimentos', 'nota_media');
  },
};
