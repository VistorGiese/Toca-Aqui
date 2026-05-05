'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagamentos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      contrato_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'contratos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tipo: {
        type: Sequelize.ENUM('sinal', 'restante', 'total'),
        allowNull: false,
      },
      valor: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM('pendente', 'processando', 'pago', 'falhou', 'reembolsado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente',
      },
      stripe_payment_intent_id: { type: Sequelize.STRING(255), allowNull: true, unique: true },
      stripe_charge_id: { type: Sequelize.STRING(255), allowNull: true },
      metodo_pagamento: { type: Sequelize.STRING(50), allowNull: true },
      data_pagamento: { type: Sequelize.DATE, allowNull: true },
      data_vencimento: { type: Sequelize.DATEONLY, allowNull: true },
      tentativas: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      erro_mensagem: { type: Sequelize.TEXT, allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pagamentos');
  },
};
