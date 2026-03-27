'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('perfis_artistas', 'datas_indisponiveis', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('perfis_artistas', 'datas_indisponiveis');
  },
};
