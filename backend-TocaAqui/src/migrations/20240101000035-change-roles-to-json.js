'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Converte coluna roles de VARCHAR(500) para JSON nativo do MySQL
    // MySQL 8.0.13+ suporta expression defaults para colunas JSON
    await queryInterface.sequelize.query(
      `ALTER TABLE usuarios MODIFY COLUMN roles JSON NOT NULL DEFAULT (JSON_ARRAY('common_user'))`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('usuarios', 'roles', {
      type: Sequelize.STRING(500),
      allowNull: false,
      defaultValue: '["common_user"]',
    });
  },
};
