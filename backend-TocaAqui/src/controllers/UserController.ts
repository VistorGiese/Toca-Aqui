import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import { generateToken } from '../utils/jwt';
import { validateEmailFormat, validatePasswordFormat } from '../services/userValidationServices';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, tipo_usuario } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const emailError = validateEmailFormat(email);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }

    const passwordError = validatePasswordFormat(senha);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const rolesValidas = ['admin', 'establishment_owner', 'artist', 'common_user'];
    
    const role = tipo_usuario && rolesValidas.includes(tipo_usuario) 
      ? tipo_usuario 
      : 'common_user';

    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await UserModel.create({
      nome,
      email,
      senha: hashedPassword,
      role,
    });

    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não identificado' });
    }

    const user = await UserModel.findByPk(userId, {
      include: [
        {
          model: EstablishmentProfileModel,
          as: 'EstablishmentProfiles',
          include: [
            {
              association: 'Address',
              attributes: ['rua', 'cidade', 'estado'],
            },
          ],
        },
        {
          model: ArtistProfileModel,
          as: 'ArtistProfiles',
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        establishment_profiles: (user as any).EstablishmentProfiles || [],
        artist_profiles: (user as any).ArtistProfiles || [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
  }
};

export const createEstablishmentProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      nome_estabelecimento,
      tipo_estabelecimento,
      descricao,
      generos_musicais,
      horario_abertura,
      horario_fechamento,
      endereco_id,
      telefone_contato,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não identificado' });
    }

    if (!nome_estabelecimento || !generos_musicais || !horario_abertura || !horario_fechamento || !endereco_id || !telefone_contato) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    // Verificar se o endereço já está sendo usado por outro estabelecimento ativo
    const existingEstablishment = await EstablishmentProfileModel.findOne({
      where: {
        endereco_id: endereco_id,
        esta_ativo: true,
      },
    });

    if (existingEstablishment) {
      return res.status(400).json({ 
        error: 'Este endereço já está sendo utilizado por outro estabelecimento ativo',
        estabelecimento_existente: {
          id: existingEstablishment.id,
          nome: existingEstablishment.nome_estabelecimento,
        },
      });
    }

    const profile = await EstablishmentProfileModel.create({
      usuario_id: userId,
      nome_estabelecimento,
      tipo_estabelecimento: tipo_estabelecimento || 'bar',
      descricao,
      generos_musicais,
      horario_abertura,
      horario_fechamento,
      endereco_id,
      telefone_contato,
    });

    res.status(201).json({
      message: 'Perfil de estabelecimento criado com sucesso',
      profile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar perfil de estabelecimento' });
  }
};

export const createArtistProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      nome_artistico,
      biografia,
      instrumentos,
      generos,
      anos_experiencia,
      url_portfolio,
      foto_perfil,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não identificado' });
    }

    if (!nome_artistico) {
      return res.status(400).json({ error: 'Nome artístico é obrigatório' });
    }

    const profile = await ArtistProfileModel.create({
      usuario_id: userId,
      nome_artistico,
      biografia,
      instrumentos: JSON.stringify(instrumentos || []),
      generos: JSON.stringify(generos || []),
      anos_experiencia: anos_experiencia || 0,
      url_portfolio,
      foto_perfil,
    });

    res.status(201).json({
      message: 'Perfil de artista criado com sucesso',
      profile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar perfil de artista' });
  }
};