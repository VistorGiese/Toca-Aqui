'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendamentos', 'modo_venda_ingresso', {
      type: Sequelize.ENUM('antecipada', 'na_porta'),
      allowNull: false,
      defaultValue: 'antecipada',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agendamentos', 'modo_venda_ingresso');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_agendamentos_modo_venda_ingresso;");
  },
};

