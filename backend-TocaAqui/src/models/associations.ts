// Arquivo para definir todas as associações entre modelos
import UserModel from './UserModel';
import EstablishmentProfileModel from './EstablishmentProfileModel';
import ArtistProfileModel from './ArtistProfileModel';
import AddressModel from './AddressModel';
import BandModel from './BandModel';
import BandMemberModel from './BandMemberModel';
import BookingModel from './BookingModel';
import BandApplicationModel from './BandApplicationModel';
import FavoriteModel from './FavoriteModel';
import NotificationModel from './NotificationModel';
import ContractModel from './ContractModel';
import PaymentModel from './PaymentModel';
import ContractHistoryModel from './ContractHistoryModel';
import IngressoModel from './IngressoModel';
import AvaliacaoShowModel from './AvaliacaoShowModel';
import ComentarioShowModel from './ComentarioShowModel';
import CurtidaComentarioModel from './CurtidaComentarioModel';
import SeguidorArtistaModel from './SeguidorArtistaModel';
import PreferenciaUsuarioModel from './PreferenciaUsuarioModel';
import EstablishmentMemberModel from './EstablishmentMemberModel';

// Associações do novo sistema de usuários
UserModel.hasMany(EstablishmentProfileModel, {
  foreignKey: 'usuario_id',
  as: 'EstablishmentProfiles',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

EstablishmentProfileModel.belongsTo(UserModel, {
  foreignKey: 'usuario_id',
  as: 'User',
});

UserModel.hasMany(ArtistProfileModel, {
  foreignKey: 'usuario_id',
  as: 'ArtistProfiles',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

ArtistProfileModel.belongsTo(UserModel, {
  foreignKey: 'usuario_id',
  as: 'User',
});

// Associações com endereços
EstablishmentProfileModel.belongsTo(AddressModel, {
  foreignKey: 'endereco_id',
  as: 'Address',
});

AddressModel.hasMany(EstablishmentProfileModel, {
  foreignKey: 'endereco_id',
  as: 'EstablishmentProfiles',
});

EstablishmentProfileModel.hasMany(BookingModel, {
  foreignKey: 'perfil_estabelecimento_id',
  as: 'Events', 
});

BookingModel.belongsTo(EstablishmentProfileModel, {
  foreignKey: 'perfil_estabelecimento_id',
  as: 'EstablishmentProfile',
});

BandModel.hasMany(BandApplicationModel, {
  foreignKey: 'banda_id',
  as: 'Applications',
});

BandApplicationModel.belongsTo(BandModel, {
  foreignKey: 'banda_id',
  as: 'Band',
});

BookingModel.hasMany(BandApplicationModel, {
  foreignKey: 'evento_id',
  as: 'Applications',
});

BandApplicationModel.belongsTo(BookingModel, {
  foreignKey: 'evento_id',
  as: 'Event',
});

BandApplicationModel.belongsTo(ArtistProfileModel, {
  foreignKey: 'artista_id',
  as: 'ArtistProfile',
});

// Associações do novo sistema de bandas
BandModel.hasMany(BandMemberModel, {
  foreignKey: 'banda_id',
  as: 'Members',
});

BandMemberModel.belongsTo(BandModel, {
  foreignKey: 'banda_id',
  as: 'Band',
});

ArtistProfileModel.hasMany(BandMemberModel, {
  foreignKey: 'perfil_artista_id',
  as: 'BandMemberships',
});

BandMemberModel.belongsTo(ArtistProfileModel, {
  foreignKey: 'perfil_artista_id',
  as: 'ArtistProfile',
});


// Associações de Contratos
ContractModel.belongsTo(BandApplicationModel, {
  foreignKey: 'aplicacao_id',
  as: 'Application',
});

ContractModel.belongsTo(BookingModel, {
  foreignKey: 'evento_id',
  as: 'Event',
});

ContractModel.belongsTo(BandModel, {
  foreignKey: 'banda_id',
  as: 'Band',
});

ContractModel.belongsTo(ArtistProfileModel, {
  foreignKey: 'artista_id',
  as: 'ArtistProfile',
});

ArtistProfileModel.hasMany(ContractModel, {
  foreignKey: 'artista_id',
  as: 'Contracts',
});

ContractModel.belongsTo(EstablishmentProfileModel, {
  foreignKey: 'perfil_estabelecimento_id',
  as: 'EstablishmentProfile',
});

BandApplicationModel.hasOne(ContractModel, {
  foreignKey: 'aplicacao_id',
  as: 'Contract',
});

BookingModel.hasOne(ContractModel, {
  foreignKey: 'evento_id',
  as: 'Contract',
});

BandModel.hasMany(ContractModel, {
  foreignKey: 'banda_id',
  as: 'Contracts',
});

EstablishmentProfileModel.hasMany(ContractModel, {
  foreignKey: 'perfil_estabelecimento_id',
  as: 'Contracts',
});

// Associações de Pagamentos
ContractModel.hasMany(PaymentModel, {
  foreignKey: 'contrato_id',
  as: 'Payments',
});

PaymentModel.belongsTo(ContractModel, {
  foreignKey: 'contrato_id',
  as: 'Contract',
});

// Associações de Histórico de Contratos
ContractModel.hasMany(ContractHistoryModel, {
  foreignKey: 'contrato_id',
  as: 'History',
});

ContractHistoryModel.belongsTo(ContractModel, {
  foreignKey: 'contrato_id',
  as: 'Contract',
});

ContractHistoryModel.belongsTo(UserModel, {
  foreignKey: 'usuario_id',
  as: 'User',
});

UserModel.hasMany(FavoriteModel, {
  foreignKey: 'usuario_id',
  as: 'Favorites',
});

FavoriteModel.belongsTo(UserModel, {
  foreignKey: 'usuario_id',
  as: 'User',
});

UserModel.hasMany(NotificationModel, {
  foreignKey: 'usuario_id',
  as: 'Notifications',
});

NotificationModel.belongsTo(UserModel, {
  foreignKey: 'usuario_id',
  as: 'User',
});

// Ingressos
BookingModel.hasMany(IngressoModel, { foreignKey: 'agendamento_id', as: 'Ingressos' });
IngressoModel.belongsTo(BookingModel, { foreignKey: 'agendamento_id', as: 'Show' });
IngressoModel.belongsTo(UserModel, { foreignKey: 'usuario_id', as: 'Usuario' });
UserModel.hasMany(IngressoModel, { foreignKey: 'usuario_id', as: 'Ingressos' });

// Avaliações
BookingModel.hasMany(AvaliacaoShowModel, { foreignKey: 'agendamento_id', as: 'Avaliacoes' });
AvaliacaoShowModel.belongsTo(BookingModel, { foreignKey: 'agendamento_id', as: 'Show' });
AvaliacaoShowModel.belongsTo(UserModel, { foreignKey: 'usuario_id', as: 'Usuario' });
UserModel.hasMany(AvaliacaoShowModel, { foreignKey: 'usuario_id', as: 'Avaliacoes' });

// Comentários
BookingModel.hasMany(ComentarioShowModel, { foreignKey: 'agendamento_id', as: 'Comentarios' });
ComentarioShowModel.belongsTo(BookingModel, { foreignKey: 'agendamento_id', as: 'Show' });
ComentarioShowModel.belongsTo(UserModel, { foreignKey: 'usuario_id', as: 'Usuario' });
ComentarioShowModel.hasMany(ComentarioShowModel, { foreignKey: 'parent_id', as: 'Respostas' });
ComentarioShowModel.hasMany(CurtidaComentarioModel, { foreignKey: 'comentario_id', as: 'Curtidas' });
CurtidaComentarioModel.belongsTo(ComentarioShowModel, { foreignKey: 'comentario_id', as: 'Comentario' });
CurtidaComentarioModel.belongsTo(UserModel, { foreignKey: 'usuario_id', as: 'Usuario' });

// Seguidores
ArtistProfileModel.hasMany(SeguidorArtistaModel, { foreignKey: 'perfil_artista_id', as: 'Seguidores' });
SeguidorArtistaModel.belongsTo(ArtistProfileModel, { foreignKey: 'perfil_artista_id', as: 'ArtistProfile' });
SeguidorArtistaModel.belongsTo(UserModel, { foreignKey: 'usuario_id', as: 'Usuario' });
UserModel.hasMany(SeguidorArtistaModel, { foreignKey: 'usuario_id', as: 'Seguindo' });

// Preferências
UserModel.hasOne(PreferenciaUsuarioModel, { foreignKey: 'usuario_id', as: 'Preferencias' });
PreferenciaUsuarioModel.belongsTo(UserModel, { foreignKey: 'usuario_id', as: 'Usuario' });

// Membros/gerenciadores de estabelecimento
EstablishmentProfileModel.hasMany(EstablishmentMemberModel, {
  foreignKey: 'estabelecimento_id',
  as: 'Members',
});
EstablishmentMemberModel.belongsTo(EstablishmentProfileModel, {
  foreignKey: 'estabelecimento_id',
  as: 'EstablishmentProfile',
});
UserModel.hasMany(EstablishmentMemberModel, {
  foreignKey: 'usuario_id',
  as: 'EstablishmentMemberships',
});
EstablishmentMemberModel.belongsTo(UserModel, {
  foreignKey: 'usuario_id',
  as: 'User',
});

export {
  UserModel,
  EstablishmentProfileModel,
  ArtistProfileModel,
  AddressModel,
  BandModel,
  BandMemberModel,
  BookingModel,
  BandApplicationModel,
  FavoriteModel,
  NotificationModel,
  ContractModel,
  PaymentModel,
  ContractHistoryModel,
  IngressoModel,
  AvaliacaoShowModel,
  ComentarioShowModel,
  CurtidaComentarioModel,
  SeguidorArtistaModel,
  PreferenciaUsuarioModel,
  EstablishmentMemberModel,
};