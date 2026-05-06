'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('perfis_artistas', 'tipo_atuacao', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('perfis_artistas', 'cache_minimo', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('perfis_artistas', 'cache_maximo', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('perfis_artistas', 'tem_estrutura_som', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('perfis_artistas', 'estrutura_som', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]',
    });
    await queryInterface.addColumn('perfis_artistas', 'cidade', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('perfis_artistas', 'estado', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
    await queryInterface.addColumn('perfis_artistas', 'links_sociais', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('perfis_artistas', 'tipo_atuacao');
    await queryInterface.removeColumn('perfis_artistas', 'cache_minimo');
    await queryInterface.removeColumn('perfis_artistas', 'cache_maximo');
    await queryInterface.removeColumn('perfis_artistas', 'tem_estrutura_som');
    await queryInterface.removeColumn('perfis_artistas', 'estrutura_som');
    await queryInterface.removeColumn('perfis_artistas', 'cidade');
    await queryInterface.removeColumn('perfis_artistas', 'estado');
    await queryInterface.removeColumn('perfis_artistas', 'links_sociais');
  },
};
