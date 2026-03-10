import { Request, Response } from 'express';
import { bandApplicationService } from '../services/BandApplicationService';

const handleServiceError = (res: Response, err: any) => {
  const status = err.statusCode || 500;
  const body: any = { error: err.message || 'Erro interno do servidor' };
  if (err.extra) Object.assign(body, err.extra);
  res.status(status).json(body);
};

export const applyBandToEvent = async (req: Request, res: Response) => {
  try {
    const { banda_id, evento_id } = req.body;
    if (!banda_id || !evento_id) {
      return res.status(400).json({ error: 'banda_id e evento_id são obrigatórios' });
    }

    const aplicacao = await bandApplicationService.apply(banda_id, evento_id);
    res.status(201).json({ message: 'Banda aplicou ao evento com sucesso', aplicacao });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const acceptBandApplication = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const aplicacao = await bandApplicationService.accept(id);
    res.json({
      message: 'Banda aceita para o evento. Evento fechado para novas candidaturas e demais candidaturas rejeitadas',
      aplicacao,
    });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const getBandApplicationsForEvent = async (req: Request, res: Response) => {
  try {
    const evento_id = req.params.evento_id as string;
    const result = await bandApplicationService.getApplicationsForEvent(evento_id);

    if (result.closed) {
      return res.json({ message: 'Evento fechado - já possui banda confirmada', candidaturas: [] });
    }
    res.json(result.aplicacoes);
  } catch (err: any) {
    handleServiceError(res, err);
  }
};
