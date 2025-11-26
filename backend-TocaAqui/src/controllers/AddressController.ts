import { Request, Response } from "express";

import AddressModel from "../models/AddressModel";

export const createAddress = async (req: Request, res: Response) => {
  try {
    const { rua, numero, bairro, cidade, estado, cep } = req.body;
    if (rua && numero) {
      const existingAddressByRuaNumero = await AddressModel.findOne({ where: { rua, numero } });
      if (existingAddressByRuaNumero) {
        return res.status(400).json({ error: "Já existe um endereço cadastrado com esta rua e número." });
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
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar endereço", details: error });
  }
};


export const getAddresses = async (_req: Request, res: Response) => {
  try {
    const addresses = await AddressModel.findAll();
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar endereços", details: error });
  }
};

export const getAddressById = async (req: Request, res: Response) => {
  try {
    const address = await AddressModel.findByPk(req.params.id);
    if (!address)
      return res.status(404).json({ error: "Endereço não encontrado" });
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar endereço", details: error });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const address = await AddressModel.findByPk(req.params.id);
    if (!address)
      return res.status(404).json({ error: "Endereço não encontrado" });
    await address.update(req.body);
    res.json(address);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar endereço", details: error });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const address = await AddressModel.findByPk(req.params.id);
    if (!address)
      return res.status(404).json({ error: "Endereço não encontrado" });
    await address.destroy();
    res.json({ message: "Endereço removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover endereço", details: error });
  }
};
