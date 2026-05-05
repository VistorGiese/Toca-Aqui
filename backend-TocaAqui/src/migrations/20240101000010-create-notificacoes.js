'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notificacoes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipo: {
        type: Sequelize.ENUM(
          'aplicacao_recebida',
          'aplicacao_aceita',
          'aplicacao_rejeitada',
          'convite_banda',
          'sistema'
        ),
        allowNull: false,
      },
      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      lida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      referencia_tipo: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      referencia_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notificacoes');
  },
};
