import { Request, Response } from "express";
import BandApplicationModel from "../models/BandApplicationModel";
import BookingModel from "../models/BookingModel";
import BandModel from "../models/BandModel";
import { Op } from "sequelize";

export const applyBandToEvent = async (req: Request, res: Response) => {
  try {
    const { banda_id, evento_id } = req.body;
    
    if (!banda_id || !evento_id) {
      return res.status(400).json({ error: "banda_id e evento_id são obrigatórios" });
    }
    
    const banda = await BandModel.findByPk(banda_id);
    if (!banda) {
      return res.status(404).json({ error: "Banda não encontrada" });
    }
    
    if (!banda.esta_ativo) {
      return res.status(400).json({ error: "Banda não está ativa e não pode aplicar para eventos" });
    }
    
    const evento = await BookingModel.findByPk(evento_id);
    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    const dataEvento = new Date(evento.data_show);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataEvento < hoje) {
      return res.status(400).json({ error: "Não é possível aplicar para evento que já ocorreu" });
    }

    if (evento.status === "aceito" || evento.status === "realizado" || evento.status === "cancelado") {
      return res.status(400).json({ 
        error: "Evento não está aberto para novas candidaturas",
        status_evento: evento.status
      });
    }

    const candidaturaAceita = await BandApplicationModel.findOne({
      where: { evento_id, status: "aceito" }
    });
    
    if (candidaturaAceita) {
      return res.status(400).json({ error: "Evento já possui banda aceita e está fechado para novas candidaturas" });
    }

    const existente = await BandApplicationModel.findOne({
      where: { 
        banda_id, 
        evento_id,
        status: { [Op.notIn]: ["rejeitado", "cancelado"] }
      }
    });
    
    if (existente) {
      return res.status(400).json({ 
        error: "Banda já possui aplicação ativa para este evento",
        aplicacao_existente: {
          id: existente.id,
          status: existente.status,
          data_aplicacao: existente.data_aplicacao
        }
      });
    }
    
    const aplicacao = await BandApplicationModel.create({ banda_id, evento_id });
    
    res.status(201).json({
      message: "Banda aplicou ao evento com sucesso",
      aplicacao
    });
  } catch (error) {
    console.error("Erro ao aplicar banda ao evento:", error);
    res.status(400).json({ error: "Erro ao aplicar banda ao evento", details: error });
  }
};

export const acceptBandApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const aplicacao = await BandApplicationModel.findByPk(id);
    if (!aplicacao) {
      return res.status(404).json({ error: "Candidatura não encontrada" });
    }

    const banda = await BandModel.findByPk(aplicacao.banda_id);
    if (!banda) {
      return res.status(404).json({ error: "Banda não encontrada" });
    }
    
    if (!banda.esta_ativo) {
      return res.status(400).json({ error: "Banda não está ativa e não pode ser aceita" });
    }

    const evento = await BookingModel.findByPk(aplicacao.evento_id);
    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    if (evento.status === "realizado" || evento.status === "cancelado") {
      return res.status(400).json({ 
        error: "Não é possível aceitar candidatura para evento finalizado ou cancelado",
        status_evento: evento.status
      });
    }

    const jaAprovada = await BandApplicationModel.findOne({
      where: { evento_id: aplicacao.evento_id, status: "aceito" }
    });
    
    if (jaAprovada) {
      return res.status(400).json({ error: "Já existe banda aceita para este evento" });
    }

    await aplicacao.update({ status: "aceito" });
    
    await BookingModel.update(
      { status: "aceito" },
      { where: { id: aplicacao.evento_id } }
    );
    
    await BandApplicationModel.update(
      { status: "rejeitado" },
      {
        where: {
          evento_id: aplicacao.evento_id,
          id: { [Op.ne]: aplicacao.id },
          status: "pendente"
        }
      }
    );

    res.json({ message: "Banda aceita para o evento. Evento fechado para novas candidaturas e demais candidaturas rejeitadas", aplicacao });
  } catch (error) {
    console.error("Erro ao aceitar banda:", error);
    res.status(400).json({ error: "Erro ao aprovar banda" });
  }
};
export const getBandApplicationsForEvent = async (req: Request, res: Response) => {
  try {
    const { evento_id } = req.params;
    
    const evento = await BookingModel.findByPk(evento_id);
    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    if (evento.status === "aceito") {
      return res.json({ 
        message: "Evento fechado - já possui banda confirmada",
        candidaturas: []
      });
    }

    const aplicacoes = await BandApplicationModel.findAll({ 
      where: { evento_id },
      include: [
        {
          association: 'Band',
          attributes: ['id', 'nome_banda', 'descricao']
        }
      ]
    });
    
    res.json(aplicacoes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar aplicações de banda para evento" });
  }
};
