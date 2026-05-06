'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // MySQL allows adding new values to ENUM via ALTER COLUMN
    await queryInterface.changeColumn('notificacoes', 'tipo', {
      type: 'ENUM("aplicacao_recebida","aplicacao_aceita","aplicacao_rejeitada","convite_banda","sistema","contrato_gerado","contrato_atualizado","contrato_aceito","contrato_cancelado","pagamento_pendente","pagamento_recebido")',
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.changeColumn('notificacoes', 'tipo', {
      type: 'ENUM("aplicacao_recebida","aplicacao_aceita","aplicacao_rejeitada","convite_banda","sistema")',
      allowNull: false,
    });
  },
};
