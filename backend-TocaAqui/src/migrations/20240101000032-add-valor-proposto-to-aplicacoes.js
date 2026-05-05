'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('aplicacoes_banda_evento', 'valor_proposto', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('aplicacoes_banda_evento', 'valor_proposto');
  },
};
