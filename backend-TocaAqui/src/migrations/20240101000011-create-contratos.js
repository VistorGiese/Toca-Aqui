'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contratos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      aplicacao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'aplicacoes_banda_evento', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      evento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'agendamentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      banda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'bandas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      perfil_estabelecimento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'perfis_estabelecimentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.ENUM('rascunho', 'aguardando_aceite', 'aceito', 'cancelado', 'concluido'),
        allowNull: false,
        defaultValue: 'rascunho',
      },
      // Snapshot contratante
      nome_contratante: { type: Sequelize.STRING(255), allowNull: false },
      documento_contratante: { type: Sequelize.STRING(20), allowNull: true },
      endereco_contratante: { type: Sequelize.TEXT, allowNull: true },
      telefone_contratante: { type: Sequelize.STRING(20), allowNull: false },
      // Snapshot contratado
      nome_contratado: { type: Sequelize.STRING(255), allowNull: false },
      documento_contratado: { type: Sequelize.STRING(20), allowNull: true },
      telefone_contratado: { type: Sequelize.STRING(20), allowNull: true },
      // Evento
      data_evento: { type: Sequelize.DATEONLY, allowNull: false },
      horario_inicio: { type: Sequelize.TIME, allowNull: false },
      horario_fim: { type: Sequelize.TIME, allowNull: false },
      duracao_minutos: { type: Sequelize.INTEGER, allowNull: true },
      intervalos: { type: Sequelize.TEXT, allowNull: true },
      genero_musical: { type: Sequelize.STRING(255), allowNull: true },
      local_evento: { type: Sequelize.TEXT, allowNull: true },
      // Cachê
      cache_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      metodo_pagamento: {
        type: Sequelize.ENUM('pix', 'transferencia', 'cartao', 'dinheiro', 'stripe'),
        allowNull: false,
        defaultValue: 'stripe',
      },
      percentual_sinal: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 50.00 },
      valor_sinal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      data_pagamento_sinal: { type: Sequelize.DATEONLY, allowNull: true },
      data_pagamento_restante: { type: Sequelize.DATEONLY, allowNull: true },
      // Obrigações
      obrigacoes_contratante: { type: Sequelize.TEXT, allowNull: true },
      obrigacoes_contratado: { type: Sequelize.TEXT, allowNull: true },
      // Penalidades
      penalidade_cancelamento_72h: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0.00 },
      penalidade_cancelamento_24_72h: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 50.00 },
      penalidade_cancelamento_24h: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 100.00 },
      // Direitos e infraestrutura
      direitos_imagem: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      infraestrutura_som: { type: Sequelize.TEXT, allowNull: true },
      infraestrutura_backline: { type: Sequelize.TEXT, allowNull: true },
      observacoes: { type: Sequelize.TEXT, allowNull: true },
      // Aceite digital
      aceite_contratante: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      aceite_contratado: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      data_aceite_contratante: { type: Sequelize.DATE, allowNull: true },
      data_aceite_contratado: { type: Sequelize.DATE, allowNull: true },
      // Controle de edição
      ultima_edicao_por: {
        type: Sequelize.ENUM('contratante', 'contratado'),
        allowNull: true,
      },
      versao: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      // Timestamps
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contratos');
  },
};
