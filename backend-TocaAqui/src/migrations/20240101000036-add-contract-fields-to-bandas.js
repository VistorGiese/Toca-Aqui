'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bandas', 'cache_minimo', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('bandas', 'cache_maximo', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('bandas', 'cidade', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('bandas', 'estado', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
    await queryInterface.addColumn('bandas', 'telefone_contato', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    await queryInterface.addColumn('bandas', 'links_sociais', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]',
    });
    await queryInterface.addColumn('bandas', 'press_kit', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]',
    });
    await queryInterface.addColumn('bandas', 'tem_estrutura_som', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('bandas', 'estrutura_som', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]',
    });
    await queryInterface.addColumn('bandas', 'nota_media', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('bandas', 'shows_realizados', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('bandas', 'esta_disponivel', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('bandas', 'datas_indisponiveis', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('bandas', 'datas_indisponiveis');
    await queryInterface.removeColumn('bandas', 'esta_disponivel');
    await queryInterface.removeColumn('bandas', 'shows_realizados');
    await queryInterface.removeColumn('bandas', 'nota_media');
    await queryInterface.removeColumn('bandas', 'estrutura_som');
    await queryInterface.removeColumn('bandas', 'tem_estrutura_som');
    await queryInterface.removeColumn('bandas', 'press_kit');
    await queryInterface.removeColumn('bandas', 'links_sociais');
    await queryInterface.removeColumn('bandas', 'telefone_contato');
    await queryInterface.removeColumn('bandas', 'estado');
    await queryInterface.removeColumn('bandas', 'cidade');
    await queryInterface.removeColumn('bandas', 'cache_maximo');
    await queryInterface.removeColumn('bandas', 'cache_minimo');
  },
};
