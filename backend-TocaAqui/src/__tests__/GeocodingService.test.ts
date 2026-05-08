process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

import { geocodificarEndereco } from '../services/GeocodingService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('GeocodingService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('geocodificarEndereco', () => {
    it('retorna coordenadas quando Nominatim responde com resultado', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ lat: '-23.5505', lon: '-46.6333' }],
      });

      const result = await geocodificarEndereco('Avenida Paulista', '1000', 'São Paulo', 'SP');

      expect(result).toEqual({ latitude: -23.5505, longitude: -46.6333 });
    });

    it('retorna null quando o array de resultados está vazio', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const result = await geocodificarEndereco('Rua Inexistente', '0', 'Cidade', 'XX');

      expect(result).toBeNull();
    });

    it('retorna null quando response.ok é false', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => [],
      });

      const result = await geocodificarEndereco('Rua X', '1', 'Cidade', 'SP');

      expect(result).toBeNull();
    });

    it('retorna null quando ocorre erro de rede', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await geocodificarEndereco('Rua X', '1', 'Cidade', 'SP');

      expect(result).toBeNull();
    });

    it('monta query correta com rua, numero, cidade e estado', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ lat: '-15.7801', lon: '-47.9292' }],
      });

      await geocodificarEndereco('SQN 208', '10', 'Brasília', 'DF', '70853-080');

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('SQN+208');
      expect(calledUrl).toContain('Bras%C3%ADlia');
      expect(calledUrl).toContain('countrycodes=br');
    });
  });
});
