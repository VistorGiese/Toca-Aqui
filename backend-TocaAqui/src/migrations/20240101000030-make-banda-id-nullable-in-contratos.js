'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('contratos', 'banda_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('contratos', 'artista_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'perfis_artistas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contratos', 'artista_id');
    await queryInterface.changeColumn('contratos', 'banda_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
