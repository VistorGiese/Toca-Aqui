'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendamentos', 'preco_ingresso_inteira', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('agendamentos', 'preco_ingresso_meia', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('agendamentos', 'capacidade_maxima', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('agendamentos', 'ingressos_vendidos', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('agendamentos', 'classificacao_etaria', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    await queryInterface.addColumn('agendamentos', 'imagem_capa', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('agendamentos', 'esta_publico', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('agendamentos', 'genero_musical', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('agendamentos', 'preco_ingresso_inteira');
    await queryInterface.removeColumn('agendamentos', 'preco_ingresso_meia');
    await queryInterface.removeColumn('agendamentos', 'capacidade_maxima');
    await queryInterface.removeColumn('agendamentos', 'ingressos_vendidos');
    await queryInterface.removeColumn('agendamentos', 'classificacao_etaria');
    await queryInterface.removeColumn('agendamentos', 'imagem_capa');
    await queryInterface.removeColumn('agendamentos', 'esta_publico');
    await queryInterface.removeColumn('agendamentos', 'genero_musical');
  },
};
