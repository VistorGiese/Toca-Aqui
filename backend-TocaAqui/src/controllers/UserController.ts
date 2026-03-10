import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { authService } from '../services/AuthService';
import { uploadService } from '../services/UploadService';
import ArtistProfileModel from '../models/ArtistProfileModel';

const handleServiceError = (res: Response, err: any) => {
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Erro interno do servidor' });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.',
      user,
    });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const result = await authService.login(email, senha);
    res.json({ message: 'Login realizado com sucesso', ...result });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const logoutUser = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.token;
    if (!token) return res.status(400).json({ error: 'Token não encontrado' });

    const exp = (req.user as any)?.exp;
    if (!exp) return res.status(400).json({ error: 'Token sem data de expiração' });

    await authService.logout(token, exp);
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'Se este email estiver cadastrado, você receberá as instruções em breve.' });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await authService.resetPassword(req.body.token, req.body.nova_senha);
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };
    if (!token) return res.status(400).json({ error: 'Token é obrigatório.' });

    const result = await authService.verifyEmail(token);
    if (result.alreadyVerified) return res.json({ message: 'Email já verificado.' });
    res.json({ message: 'Email verificado com sucesso. Você já pode fazer login.' });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não identificado' });

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
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const createEstablishmentProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não identificado' });

    const profile = await authService.createEstablishmentProfile(userId, req.body);
    res.status(201).json({ message: 'Perfil de estabelecimento criado com sucesso', profile });
  } catch (err: any) {
    if (err.extra) {
      return res.status(err.statusCode || 400).json({ error: err.message, estabelecimento_existente: err.extra });
    }
    handleServiceError(res, err);
  }
};

export const createArtistProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não identificado' });

    const profile = await authService.createArtistProfile(userId, req.body);
    res.status(201).json({ message: 'Perfil de artista criado com sucesso', profile });
  } catch (err: any) {
    handleServiceError(res, err);
  }
};

export const uploadArtistPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const novaFoto = uploadService.getRelativePath(req.file);

    const profile = await ArtistProfileModel.findByPk(id as string);
    if (!profile) {
      uploadService.deleteFile(novaFoto);
      return res.status(404).json({ error: 'Perfil de artista não encontrado' });
    }

    if (profile.usuario_id !== userId && (req as any).user?.role !== 'admin') {
      uploadService.deleteFile(novaFoto);
      return res.status(403).json({ error: 'Você não tem permissão para editar este perfil' });
    }

    if (profile.foto_perfil) {
      uploadService.deleteFile(profile.foto_perfil);
    }

    await profile.update({ foto_perfil: novaFoto });

    res.json({ message: 'Foto de perfil atualizada com sucesso', foto_perfil: novaFoto });
  } catch (error) {
    if (req.file) {
      uploadService.deleteFile(uploadService.getRelativePath(req.file));
    }
    console.error('Erro ao fazer upload de foto:', error);
    res.status(500).json({ error: 'Erro ao fazer upload de foto' });
  }
};
