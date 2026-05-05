'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ingressos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      agendamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'agendamentos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipo: {
        type: Sequelize.ENUM('inteira', 'meia_entrada', 'vip'),
        allowNull: false,
      },
      preco: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pendente', 'confirmado', 'cancelado', 'utilizado'),
        allowNull: false,
        defaultValue: 'pendente',
      },
      codigo_qr: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ingressos');
  },
};
