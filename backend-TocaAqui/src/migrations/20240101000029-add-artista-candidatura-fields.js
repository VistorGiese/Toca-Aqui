'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Torna banda_id nullable
    await queryInterface.changeColumn('aplicacoes_banda_evento', 'banda_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('aplicacoes_banda_evento', 'artista_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'perfis_artistas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('aplicacoes_banda_evento', 'mensagem', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('aplicacoes_banda_evento', 'artista_id');
    await queryInterface.removeColumn('aplicacoes_banda_evento', 'mensagem');
    await queryInterface.changeColumn('aplicacoes_banda_evento', 'banda_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
