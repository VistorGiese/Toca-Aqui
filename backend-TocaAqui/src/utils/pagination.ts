import { Request } from 'express';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

export interface PaginationParams {
  page: number;
  limite: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  paginacao: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
  };
}

export const parsePagination = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limite = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limite as string) || DEFAULT_LIMIT));
  const offset = (page - 1) * limite;
  return { page, limite, offset };
};

export const buildPaginatedResponse = <T>(
  rows: T[],
  total: number,
  page: number,
  limite: number
): PaginatedResponse<T> => ({
  data: rows,
  paginacao: {
    total,
    pagina: page,
    limite,
    total_paginas: Math.ceil(total / limite),
  },
});
