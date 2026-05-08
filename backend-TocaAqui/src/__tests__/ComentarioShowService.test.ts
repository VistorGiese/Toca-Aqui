process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((cb: (t: object) => Promise<any>) => cb({})),
  },
}));

jest.mock('../models/ComentarioShowModel', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../models/CurtidaComentarioModel', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {},
}));

import { comentarioShowService } from '../services/ComentarioShowService';
import ComentarioShowModel from '../models/ComentarioShowModel';
import CurtidaComentarioModel from '../models/CurtidaComentarioModel';

const makeComentario = (overrides = {}) => ({
  id: 1,
  agendamento_id: 10,
  texto: 'Ótimo show!',
  parent_id: null,
  curtidas_count: 0,
  toJSON: jest.fn().mockReturnValue({ id: 1, texto: 'Ótimo show!' }),
  update: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('ComentarioShowService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── getComentariosByShow ──────────────────────────────────────────────────
  describe('getComentariosByShow', () => {
    it('retorna comentários com curtiu=false quando usuário não informado', async () => {
      const c = makeComentario();
      (ComentarioShowModel.findAll as jest.Mock).mockResolvedValue([c]);

      const result = await comentarioShowService.getComentariosByShow(10);

      expect(result).toHaveLength(1);
      expect(result[0].curtiu).toBe(false);
    });

    it('retorna comentários com curtiu=true quando usuário curtiu', async () => {
      const c = makeComentario({ id: 5 });
      c.toJSON = jest.fn().mockReturnValue({ id: 5, texto: 'Ótimo!' });
      (ComentarioShowModel.findAll as jest.Mock).mockResolvedValue([c]);
      (CurtidaComentarioModel.findAll as jest.Mock).mockResolvedValue([{ comentario_id: 5 }]);

      const result = await comentarioShowService.getComentariosByShow(10, 99);

      expect(result[0].curtiu).toBe(true);
    });

    it('retorna curtiu=false quando usuário não curtiu', async () => {
      const c = makeComentario({ id: 7 });
      (ComentarioShowModel.findAll as jest.Mock).mockResolvedValue([c]);
      (CurtidaComentarioModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await comentarioShowService.getComentariosByShow(10, 99);

      expect(result[0].curtiu).toBe(false);
    });
  });

  // ─── criarComentario ──────────────────────────────────────────────────────
  describe('criarComentario', () => {
    it('cria comentário raiz com sucesso', async () => {
      const comentarioCriado = makeComentario();
      const comentarioComUsuario = makeComentario();
      (ComentarioShowModel.create as jest.Mock).mockResolvedValue(comentarioCriado);
      (ComentarioShowModel.findByPk as jest.Mock).mockResolvedValue(comentarioComUsuario);

      const result = await comentarioShowService.criarComentario({
        usuario_id: 1,
        agendamento_id: 10,
        texto: 'Ótimo show!',
      });

      expect(ComentarioShowModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: 1, agendamento_id: 10, texto: 'Ótimo show!' })
      );
      expect(result).toBe(comentarioComUsuario);
    });

    it('cria resposta a comentário pai válido', async () => {
      const pai = makeComentario({ id: 2, parent_id: null });
      const resposta = makeComentario({ id: 3, parent_id: 2 });
      (ComentarioShowModel.findOne as jest.Mock).mockResolvedValue(pai);
      (ComentarioShowModel.create as jest.Mock).mockResolvedValue(resposta);
      (ComentarioShowModel.findByPk as jest.Mock).mockResolvedValue(resposta);

      const result = await comentarioShowService.criarComentario({
        usuario_id: 1,
        agendamento_id: 10,
        texto: 'Concordo!',
        parent_id: 2,
      });

      expect(result).toBe(resposta);
    });

    it('lança 404 quando parent_id não encontrado', async () => {
      (ComentarioShowModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        comentarioShowService.criarComentario({
          usuario_id: 1,
          agendamento_id: 10,
          texto: 'Resposta',
          parent_id: 999,
        })
      ).rejects.toEqual(expect.objectContaining({ statusCode: 404 }));
    });

    it('lança 400 ao tentar responder a uma resposta (aninhamento duplo)', async () => {
      const respostaJaExistente = makeComentario({ id: 2, parent_id: 1 });
      (ComentarioShowModel.findOne as jest.Mock).mockResolvedValue(respostaJaExistente);

      await expect(
        comentarioShowService.criarComentario({
          usuario_id: 1,
          agendamento_id: 10,
          texto: 'Resposta de resposta',
          parent_id: 2,
        })
      ).rejects.toEqual(expect.objectContaining({ statusCode: 400 }));
    });
  });

  // ─── curtirComentario ─────────────────────────────────────────────────────
  describe('curtirComentario', () => {
    it('lança 404 quando comentário não encontrado', async () => {
      (ComentarioShowModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(comentarioShowService.curtirComentario(999, 1)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('remove curtida quando já curtiu (toggle off)', async () => {
      const comentario = makeComentario({ curtidas_count: 1 });
      const curtidaExistente = { destroy: jest.fn().mockResolvedValue(undefined) };

      (ComentarioShowModel.findByPk as jest.Mock).mockResolvedValue(comentario);
      (CurtidaComentarioModel.findOne as jest.Mock).mockResolvedValue(curtidaExistente);

      const result = await comentarioShowService.curtirComentario(1, 10);

      expect(curtidaExistente.destroy).toHaveBeenCalled();
      expect(result).toEqual({ curtiu: false, curtidas_count: 0 });
    });

    it('adiciona curtida quando ainda não curtiu (toggle on)', async () => {
      const comentario = makeComentario({ curtidas_count: 3 });

      (ComentarioShowModel.findByPk as jest.Mock).mockResolvedValue(comentario);
      (CurtidaComentarioModel.findOne as jest.Mock).mockResolvedValue(null);
      (CurtidaComentarioModel.create as jest.Mock).mockResolvedValue({});

      const result = await comentarioShowService.curtirComentario(1, 10);

      expect(CurtidaComentarioModel.create).toHaveBeenCalled();
      expect(result).toEqual({ curtiu: true, curtidas_count: 4 });
    });

    it('não deixa curtidas_count ficar negativo ao descurtir', async () => {
      const comentario = makeComentario({ curtidas_count: 0 });
      const curtidaExistente = { destroy: jest.fn().mockResolvedValue(undefined) };

      (ComentarioShowModel.findByPk as jest.Mock).mockResolvedValue(comentario);
      (CurtidaComentarioModel.findOne as jest.Mock).mockResolvedValue(curtidaExistente);

      const result = await comentarioShowService.curtirComentario(1, 10);

      expect(result.curtidas_count).toBe(0);
    });
  });
});
