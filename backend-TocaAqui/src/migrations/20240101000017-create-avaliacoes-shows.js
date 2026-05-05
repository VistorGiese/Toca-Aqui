'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('avaliacoes_shows', {
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
      nota_artista: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nota_local: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tags_artista: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      tags_local: {
        type: Sequelize.JSON,
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

    await queryInterface.addIndex('avaliacoes_shows', ['usuario_id', 'agendamento_id'], {
      unique: true,
      name: 'avaliacoes_shows_usuario_agendamento_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('avaliacoes_shows');
  },
};
