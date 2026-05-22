'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Adicionar coluna roles como TEXT (JSON string)
    await queryInterface.addColumn('usuarios', 'roles', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '["common_user"]',
    });

    // 2. Popular roles a partir do role existente de cada usuário
    await queryInterface.sequelize.query(
      `UPDATE usuarios SET roles = CONCAT('["', role, '"]')`
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('usuarios', 'roles');
  },
};
