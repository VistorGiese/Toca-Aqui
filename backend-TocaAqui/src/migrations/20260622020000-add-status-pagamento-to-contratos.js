'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('contratos');
    if (table.status_pagamento) return;

    await queryInterface.addColumn('contratos', 'status_pagamento', {
      type: Sequelize.ENUM('pendente', 'pago', 'falhou'),
      allowNull: false,
      defaultValue: 'pendente',
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('contratos');
    if (!table.status_pagamento) return;

    await queryInterface.removeColumn('contratos', 'status_pagamento');
  },
};
