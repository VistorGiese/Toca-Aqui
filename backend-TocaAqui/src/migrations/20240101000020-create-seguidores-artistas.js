'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seguidores_artistas', {
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
      perfil_artista_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'perfis_artistas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex('seguidores_artistas', ['usuario_id', 'perfil_artista_id'], {
      unique: true,
      name: 'seguidores_artistas_usuario_perfil_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('seguidores_artistas');
  },
};
