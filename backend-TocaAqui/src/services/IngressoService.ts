import { Op } from 'sequelize';
import sequelize from '../config/database';
import IngressoModel, { IngressoStatus, IngressoTipo } from '../models/IngressoModel';
import BookingModel from '../models/BookingModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';
import { badRequest, notFound, unauthorized } from '../errors/AppError';

class IngressoService {
  private gerarCodigoQR(): string {
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `TKT-${Date.now()}-${random}`;
  }

  async comprarIngresso(data: {
    usuario_id: number;
    agendamento_id: number;
    tipo: 'inteira' | 'meia_entrada' | 'vip';
    nome_comprador: string;
    cpf: string;
    telefone: string;
  }): Promise<any> {
    const show = await BookingModel.findOne({
      where: { id: data.agendamento_id, esta_publico: true },
    });

    if (!show) {
      throw notFound('Show não encontrado ou não está disponível para venda');
    }

    const agora = new Date();
    const dataShow = new Date(show.data_show);
    dataShow.setHours(0, 0, 0, 0);
    const hoje = new Date(agora);
    hoje.setHours(0, 0, 0, 0);

    if (dataShow < hoje) {
      throw badRequest('Este show já aconteceu');
    }

    if (dataShow.getTime() === hoje.getTime()) {
      const [horas, minutos] = (show.horario_inicio as string).split(':').map(Number);
      const inicioShow = new Date(agora);
      inicioShow.setHours(horas, minutos, 0, 0);
      if (agora >= inicioShow) {
        throw badRequest('Este show já começou');
      }
    }

    if (show.capacidade_maxima && show.ingressos_vendidos >= show.capacidade_maxima) {
      throw badRequest('Show esgotado');
    }

    let preco: number;
    if (data.tipo === 'inteira') {
      if (!show.preco_ingresso_inteira) {
        throw badRequest('Ingresso inteira não disponível para este show');
      }
      preco = Number(show.preco_ingresso_inteira);
    } else if (data.tipo === 'meia_entrada') {
      if (!show.preco_ingresso_meia) {
        throw badRequest('Meia entrada não disponível para este show');
      }
      preco = Number(show.preco_ingresso_meia);
    } else {
      if (!show.preco_ingresso_inteira) {
        throw badRequest('Ingresso VIP não disponível para este show');
      }
      preco = Number(show.preco_ingresso_inteira) * 1.5;
    }

    const ingressoExistente = await IngressoModel.findOne({
      where: {
        usuario_id: data.usuario_id,
        agendamento_id: data.agendamento_id,
        status: { [Op.in]: [IngressoStatus.CONFIRMADO, IngressoStatus.PENDENTE] },
      },
    });

    if (ingressoExistente) {
      throw badRequest('Você já possui um ingresso para este show');
    }

    const resultado = await sequelize.transaction(async (t) => {
      const codigo_qr = this.gerarCodigoQR();

      const ingresso = await IngressoModel.create(
        {
          usuario_id: data.usuario_id,
          agendamento_id: data.agendamento_id,
          tipo: data.tipo as IngressoTipo,
          preco,
          status: IngressoStatus.CONFIRMADO,
          codigo_qr,
        },
        { transaction: t }
      );

      await show.increment('ingressos_vendidos', { by: 1, transaction: t });

      return ingresso;
    });

    return resultado;
  }

  async getMeusIngressos(usuario_id: number, tipo?: 'proximos' | 'passados'): Promise<any[]> {
    const hoje = new Date();

    const whereShow: any = {};
    if (tipo === 'proximos') {
      whereShow.data_show = { [Op.gte]: hoje };
    } else if (tipo === 'passados') {
      whereShow.data_show = { [Op.lt]: hoje };
    }

    const ingressos = await IngressoModel.findAll({
      where: { usuario_id },
      include: [
        {
          model: BookingModel,
          as: 'Show',
          where: whereShow,
          required: Object.keys(whereShow).length > 0,
          include: [
            {
              model: EstablishmentProfileModel,
              as: 'EstablishmentProfile',
              include: [{ model: AddressModel, as: 'Address' }],
            },
          ],
        },
      ],
      order: [[{ model: BookingModel, as: 'Show' }, 'data_show', tipo === 'passados' ? 'DESC' : 'ASC']],
    });

    return ingressos;
  }

  async getIngressoById(id: number, usuario_id: number): Promise<any> {
    const ingresso = await IngressoModel.findOne({
      where: { id },
      include: [
        {
          model: BookingModel,
          as: 'Show',
          include: [
            {
              model: EstablishmentProfileModel,
              as: 'EstablishmentProfile',
              include: [{ model: AddressModel, as: 'Address' }],
            },
          ],
        },
      ],
    });

    if (!ingresso) {
      throw notFound('Ingresso não encontrado');
    }

    if (ingresso.usuario_id !== usuario_id) {
      throw unauthorized('Você não tem permissão para visualizar este ingresso');
    }

    return ingresso;
  }
}

export const ingressoService = new IngressoService();
