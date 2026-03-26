'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('perfis_estabelecimentos', 'endereco_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'enderecos', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('perfis_estabelecimentos', 'endereco_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'enderecos', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
};
