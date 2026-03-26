'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estabelecimento_membros', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      estabelecimento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'perfis_estabelecimentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('admin'),
        allowNull: false,
        defaultValue: 'admin',
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

    await queryInterface.addIndex('estabelecimento_membros', ['estabelecimento_id', 'usuario_id'], {
      unique: true,
      name: 'unique_estabelecimento_usuario',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('estabelecimento_membros');
  },
};
