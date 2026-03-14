import { Request, Response } from "express";
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';
import AddressModel from "../models/AddressModel";

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const { rua, numero, bairro, cidade, estado, cep } = req.body;
  if (rua && numero) {
    const existingAddressByRuaNumero = await AddressModel.findOne({ where: { rua, numero } });
    if (existingAddressByRuaNumero) {
      throw new AppError("Já existe um endereço cadastrado com esta rua e número.", 400);
    }
  }
  const address = await AddressModel.create({
    rua,
    numero,
    bairro,
    cidade,
    estado,
    cep
  });
  res.status(201).json(address);
});

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const { count, rows } = await AddressModel.findAndCountAll({ limit, offset });
  res.json({
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

export const getAddressById = asyncHandler(async (req: Request, res: Response) => {
  const address = await AddressModel.findByPk(req.params.id as string);
  if (!address) throw new AppError("Endereço não encontrado", 404);
  res.json(address);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await AddressModel.findByPk(req.params.id as string);
  if (!address) throw new AppError("Endereço não encontrado", 404);
  await address.update(req.body);
  res.json(address);
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await AddressModel.findByPk(req.params.id as string);
  if (!address) throw new AppError("Endereço não encontrado", 404);
  await address.destroy();
  res.json({ message: "Endereço removido com sucesso" });
});
