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

// Associações do novo sistema de usuários
UserModel.hasMany(EstablishmentProfileModel, {
  foreignKey: 'usuario_id',
  as: 'EstablishmentProfiles',
});

EstablishmentProfileModel.belongsTo(UserModel, {
  foreignKey: 'usuario_id',
  as: 'User',
});

UserModel.hasMany(ArtistProfileModel, {
  foreignKey: 'usuario_id',
  as: 'ArtistProfiles',
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
};