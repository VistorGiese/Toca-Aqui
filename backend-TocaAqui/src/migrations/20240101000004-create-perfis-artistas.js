'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('perfis_artistas', {
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
      nome_artistico: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      biografia: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      instrumentos: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '[]',
      },
      generos: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '[]',
      },
      anos_experiencia: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      url_portfolio: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      foto_perfil: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      esta_disponivel: {
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
    await queryInterface.dropTable('perfis_artistas');
  },
};
