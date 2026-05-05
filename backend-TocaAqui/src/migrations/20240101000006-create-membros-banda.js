'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('membros_banda', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      banda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'bandas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      perfil_artista_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'perfis_artistas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      funcao: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Função na banda (ex: guitarrista, vocalista, baterista)',
      },
      e_lider: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      data_entrada: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('membros_banda', ['banda_id', 'perfil_artista_id'], {
      unique: true,
      name: 'unique_band_artist_membership',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('membros_banda');
  },
};
