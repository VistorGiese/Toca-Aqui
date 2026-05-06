'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('perfis_estabelecimentos', {
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
      nome_estabelecimento: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tipo_estabelecimento: {
        type: Sequelize.ENUM('bar', 'casa_show', 'restaurante', 'club', 'outro'),
        allowNull: false,
        defaultValue: 'bar',
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      generos_musicais: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      horario_abertura: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      horario_fechamento: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      endereco_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'enderecos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      telefone_contato: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      fotos: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      esta_ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('perfis_estabelecimentos');
  },
};
