'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('curtidas_comentarios', {
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
      comentario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'comentarios_shows',
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

    await queryInterface.addIndex('curtidas_comentarios', ['usuario_id', 'comentario_id'], {
      unique: true,
      name: 'curtidas_comentarios_usuario_comentario_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('curtidas_comentarios');
  },
};
