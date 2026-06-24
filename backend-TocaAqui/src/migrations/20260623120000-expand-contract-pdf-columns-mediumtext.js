'use strict';

/** Colunas usadas para armazenar PDFs em base64 no fluxo offline. */
const PDF_COLUMNS = [
  'obrigacoes_contratante',
  'obrigacoes_contratado',
  'infraestrutura_som',
  'infraestrutura_backline',
  'intervalos',
  'genero_musical',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const column of PDF_COLUMNS) {
      await queryInterface.changeColumn('contratos', column, {
        type: Sequelize.TEXT('medium'),
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const revertGenero = { type: Sequelize.STRING(255), allowNull: true };
    const revertText = { type: Sequelize.TEXT, allowNull: true };

    for (const column of PDF_COLUMNS) {
      await queryInterface.changeColumn(
        'contratos',
        column,
        column === 'genero_musical' ? revertGenero : revertText,
      );
    }
  },
};
