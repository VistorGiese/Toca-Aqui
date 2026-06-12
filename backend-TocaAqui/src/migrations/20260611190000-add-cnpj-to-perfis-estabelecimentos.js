'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('perfis_estabelecimentos', 'cnpj', {
      type: Sequelize.STRING(18),
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('perfis_estabelecimentos', 'cnpj');
  },
};

