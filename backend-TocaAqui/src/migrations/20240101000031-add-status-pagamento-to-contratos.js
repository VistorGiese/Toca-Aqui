'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contratos', 'status_pagamento', {
      type: Sequelize.ENUM('pendente', 'pago', 'falhou'),
      allowNull: false,
      defaultValue: 'pendente',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('contratos', 'status_pagamento');
  },
};
