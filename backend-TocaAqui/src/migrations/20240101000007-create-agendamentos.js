'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendamentos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      titulo_evento: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao_evento: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      data_show: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      perfil_estabelecimento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'perfis_estabelecimentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      horario_inicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      horario_fim: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pendente', 'aceito', 'rejeitado', 'cancelado', 'realizado'),
        allowNull: false,
        defaultValue: 'pendente',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('agendamentos');
  },
};
