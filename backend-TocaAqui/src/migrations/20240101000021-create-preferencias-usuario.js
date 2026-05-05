'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('preferencias_usuario', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      generos_favoritos: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      cidade: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      raio_busca_km: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
      },
      tipos_local: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      notif_novos_shows: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      notif_lembretes: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('preferencias_usuario');
  },
};
