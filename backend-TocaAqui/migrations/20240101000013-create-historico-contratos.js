'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historico_contratos', {
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
        onDelete: 'CASCADE',
      },
      campo_alterado: { type: Sequelize.STRING(100), allowNull: false },
      valor_anterior: { type: Sequelize.TEXT, allowNull: true },
      valor_novo: { type: Sequelize.TEXT, allowNull: true },
      alterado_por: {
        type: Sequelize.ENUM('contratante', 'contratado'),
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('historico_contratos');
  },
};
