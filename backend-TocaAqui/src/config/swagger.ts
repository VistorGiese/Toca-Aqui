import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Toca Aqui API',
    version: '1.0.0',
    description: 'API para plataforma de conexão entre bandas e estabelecimentos',
    contact: {
      name: 'Toca Aqui Team',
      email: 'contato@tocaaqui.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local - API Principal',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido após login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Mensagem de erro',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Status da operação',
          },
          message: {
            type: 'string',
            description: 'Mensagem de sucesso',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID do usuário',
          },
          nome: {
            type: 'string',
            description: 'Nome completo do usuário',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email do usuário',
          },
          role: {
            type: 'string',
            enum: ['admin', 'establishment_owner', 'artist', 'common_user'],
            description: 'Papel do usuário no sistema',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          rua: {
            type: 'string',
            description: 'Nome da rua',
          },
          numero: {
            type: 'string',
            description: 'Número do endereço',
          },
          bairro: {
            type: 'string',
            description: 'Bairro',
          },
          cidade: {
            type: 'string',
            description: 'Cidade',
          },
          estado: {
            type: 'string',
            description: 'UF do estado (2 caracteres)',
            maxLength: 2,
          },
          cep: {
            type: 'string',
            description: 'CEP sem formatação',
          },
        },
      },
      Band: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          nome_banda: {
            type: 'string',
            description: 'Nome da banda',
          },
          descricao: {
            type: 'string',
            description: 'Descrição/biografia da banda',
          },
          imagem: {
            type: 'string',
            nullable: true,
            description: 'URL da imagem da banda',
          },
          generos_musicais: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Lista de gêneros musicais',
          },
          data_criacao: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação da banda',
          },
          esta_ativo: {
            type: 'boolean',
            description: 'Se a banda está ativa',
          },
        },
      },
      Establishment: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          usuario_id: {
            type: 'integer',
            description: 'ID do proprietário',
          },
          nome_estabelecimento: {
            type: 'string',
            description: 'Nome do estabelecimento',
          },
          tipo_estabelecimento: {
            type: 'string',
            enum: ['bar', 'casa_show', 'restaurante', 'club', 'outro'],
            description: 'Tipo do estabelecimento',
          },
          descricao: {
            type: 'string',
            description: 'Descrição do estabelecimento',
          },
          generos_musicais: {
            type: 'string',
            description: 'Gêneros musicais aceitos (separados por vírgula)',
          },
          horario_abertura: {
            type: 'string',
            format: 'time',
            description: 'Horário de abertura (HH:MM:SS)',
          },
          horario_fechamento: {
            type: 'string',
            format: 'time',
            description: 'Horário de fechamento (HH:MM:SS)',
          },
          endereco_id: {
            type: 'integer',
            description: 'ID do endereço',
          },
          telefone_contato: {
            type: 'string',
            description: 'Telefone de contato',
          },
          fotos: {
            type: 'string',
            nullable: true,
            description: 'URLs das fotos (JSON)',
          },
          esta_ativo: {
            type: 'boolean',
            description: 'Se o estabelecimento está ativo',
          },
          Address: {
            $ref: '#/components/schemas/Address',
          },
          User: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          perfil_estabelecimento_id: {
            type: 'integer',
            description: 'ID do perfil do estabelecimento',
          },
          data_show: {
            type: 'string',
            format: 'date',
            description: 'Data do show',
          },
          horario_inicio: {
            type: 'string',
            format: 'time',
            description: 'Horário de início',
          },
          horario_fim: {
            type: 'string',
            format: 'time',
            description: 'Horário de término',
          },
          descricao: {
            type: 'string',
            description: 'Descrição do evento',
          },
          status: {
            type: 'string',
            enum: ['pendente', 'aceito', 'rejeitado', 'cancelado', 'realizado'],
            description: 'Status do evento',
          },
        },
      },
      Favorite: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          usuario_id: {
            type: 'integer',
            description: 'ID do usuário',
          },
          favoritavel_tipo: {
            type: 'string',
            enum: ['perfil_estabelecimento', 'perfil_artista', 'banda'],
            description: 'Tipo do item favoritado',
          },
          favoritavel_id: {
            type: 'integer',
            description: 'ID do item favoritado',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Autenticação',
      description: 'Endpoints de registro, login e perfil de usuário',
    },
    {
      name: 'Bandas',
      description: 'Gerenciamento de bandas',
    },
    {
      name: 'Estabelecimentos',
      description: 'Gerenciamento de estabelecimentos',
    },
    {
      name: 'Endereços',
      description: 'Gerenciamento de endereços',
    },
    {
      name: 'Eventos/Agendamentos',
      description: 'Gerenciamento de eventos e agendamentos',
    },
    {
      name: 'Favoritos',
      description: 'Sistema de favoritos',
    },
    {
      name: 'Admin',
      description: 'Endpoints administrativos (apenas admin)',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
