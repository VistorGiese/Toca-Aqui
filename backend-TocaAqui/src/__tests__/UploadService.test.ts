process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';

// O UploadService usa fs diretamente. Para testar os métodos públicos sem
// depender do filesystem real, fazemos spy nos métodos do módulo fs que são
// importados pelo UploadService. Como a classe usa require('fs') no mesmo
// módulo, precisamos garantir que o spy seja configurado antes do import.
// A estratégia: mock completo do módulo fs antes de qualquer import.

jest.mock('fs', () => {
  const original = jest.requireActual('fs');
  return {
    ...original,
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    unlinkSync: jest.fn(),
    statSync: jest.fn(),
  };
});

import fs from 'fs';
import path from 'path';

// Importar DEPOIS do mock de fs
import { uploadService } from '../services/UploadService';

describe('UploadService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('deleteFile', () => {
    it('deleta arquivo existente (caminho absoluto) e retorna true', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const result = uploadService.deleteFile('/tmp/foto.jpg');

      expect(result).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/foto.jpg');
    });

    it('retorna false quando arquivo não existe', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = uploadService.deleteFile('/tmp/nao-existe.jpg');

      expect(result).toBe(false);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('retorna false quando unlinkSync lança exceção', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error('permissão negada');
      });

      const result = uploadService.deleteFile('/tmp/protegido.jpg');

      expect(result).toBe(false);
    });

    it('resolve caminho relativo para absoluto antes de verificar/deletar', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      uploadService.deleteFile('uploads/foto.jpg');

      const pathPassado = (fs.unlinkSync as jest.Mock).mock.calls[0][0];
      expect(path.isAbsolute(pathPassado)).toBe(true);
      expect(pathPassado).toContain('foto.jpg');
    });
  });

  describe('getRelativePath', () => {
    it('retorna o caminho relativo com prefixo uploads/', () => {
      const fakeFile = { filename: 'abc-123-timestamp.jpg' } as Express.Multer.File;

      const result = uploadService.getRelativePath(fakeFile);

      expect(result).toBe('uploads/abc-123-timestamp.jpg');
    });
  });

  describe('fileExists', () => {
    it('retorna true quando arquivo existe', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = uploadService.fileExists('/tmp/foto.jpg');

      expect(result).toBe(true);
    });

    it('retorna false quando arquivo não existe', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = uploadService.fileExists('/tmp/inexistente.jpg');

      expect(result).toBe(false);
    });
  });

  describe('fileFilter (via acesso interno)', () => {
    const makeFile = (originalname: string, mimetype: string) =>
      ({ originalname, mimetype } as Express.Multer.File);

    it('chama cb(null, true) para jpg com mime válido', () => {
      const cb = jest.fn();
      (uploadService as any).fileFilter({}, makeFile('foto.jpg', 'image/jpeg'), cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('chama cb(null, true) para png com mime válido', () => {
      const cb = jest.fn();
      (uploadService as any).fileFilter({}, makeFile('foto.png', 'image/png'), cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('chama cb(null, true) para webp com mime válido', () => {
      const cb = jest.fn();
      (uploadService as any).fileFilter({}, makeFile('foto.webp', 'image/webp'), cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('chama cb(Error) quando extensão não é permitida', () => {
      const cb = jest.fn();
      (uploadService as any).fileFilter({}, makeFile('virus.exe', 'image/jpeg'), cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
      expect((cb.mock.calls[0][0] as Error).message).toContain('.exe');
    });

    it('chama cb(Error) quando MIME type não é permitido mesmo com extensão válida', () => {
      const cb = jest.fn();
      (uploadService as any).fileFilter({}, makeFile('foto.jpg', 'application/octet-stream'), cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('uploadSingle e uploadMultiple', () => {
    it('uploadSingle é uma função (middleware multer)', () => {
      expect(typeof uploadService.uploadSingle).toBe('function');
    });

    it('uploadMultiple é uma função (middleware multer)', () => {
      expect(typeof uploadService.uploadMultiple).toBe('function');
    });
  });

  describe('getFileInfo', () => {
    it('retorna size e created quando arquivo existe', () => {
      const fakeStats = { size: 2048, birthtime: new Date('2025-06-01') };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(fakeStats);

      const info = uploadService.getFileInfo('/tmp/foto.jpg');

      expect(info).toEqual({ size: 2048, created: fakeStats.birthtime });
    });

    it('retorna null quando arquivo não existe', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const info = uploadService.getFileInfo('/tmp/inexistente.jpg');

      expect(info).toBeNull();
    });

    it('retorna null quando statSync lança exceção', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error('stat error');
      });

      const info = uploadService.getFileInfo('/tmp/corrompido.jpg');

      expect(info).toBeNull();
    });
  });
});
