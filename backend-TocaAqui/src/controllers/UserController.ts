import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { authService } from '../services/AuthService';
import { uploadService } from '../services/UploadService';
import { AppError } from '../errors/AppError';
import ArtistProfileModel from '../models/ArtistProfileModel';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json({
    message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.',
    user,
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha) throw new AppError('Email e senha são obrigatórios', 400);
  const result = await authService.login(email, senha);
  res.json({ message: 'Login realizado com sucesso', ...result });
});

export const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.token;
  if (!token) throw new AppError('Token não encontrado', 400);

  const exp = (req.user as any)?.exp;
  if (!exp) throw new AppError('Token sem data de expiração', 400);

  await authService.logout(token, exp);
  res.json({ message: 'Logout realizado com sucesso' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res.json({ message: 'Se este email estiver cadastrado, você receberá as instruções em breve.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.nova_senha);
  res.json({ message: 'Senha redefinida com sucesso.' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  if (!token) throw new AppError('Token é obrigatório.', 400);
  const result = await authService.verifyEmail(token);
  if (result.alreadyVerified) return res.json({ message: 'Email já verificado.' });
  res.json({ message: 'Email verificado com sucesso. Você já pode fazer login.' });
});

export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Usuário não identificado', 401);
  const user = await authService.getUserProfile(userId);
  res.json({
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      establishment_profiles: (user as any).EstablishmentProfiles || [],
      artist_profiles: (user as any).ArtistProfiles || [],
    },
  });
});

export const createEstablishmentProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Usuário não identificado', 401);
  const profile = await authService.createEstablishmentProfile(userId, req.body);
  res.status(201).json({ message: 'Perfil de estabelecimento criado com sucesso', profile });
});

export const createArtistProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Usuário não identificado', 401);
  const profile = await authService.createArtistProfile(userId, req.body);
  res.status(201).json({ message: 'Perfil de artista criado com sucesso', profile });
});

export const uploadArtistPhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  if (!req.file) throw new AppError('Nenhuma imagem enviada', 400);

  const novaFoto = uploadService.getRelativePath(req.file);

  const profile = await ArtistProfileModel.findByPk(id);
  if (!profile) {
    uploadService.deleteFile(novaFoto);
    throw new AppError('Perfil de artista não encontrado', 404);
  }

  if (profile.usuario_id !== userId && req.user?.role !== 'admin') {
    uploadService.deleteFile(novaFoto);
    throw new AppError('Você não tem permissão para editar este perfil', 403);
  }

  if (profile.foto_perfil) uploadService.deleteFile(profile.foto_perfil);
  await profile.update({ foto_perfil: novaFoto });

  res.json({ message: 'Foto de perfil atualizada com sucesso', foto_perfil: novaFoto });
});
