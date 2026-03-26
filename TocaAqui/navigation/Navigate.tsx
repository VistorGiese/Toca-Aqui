import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { Booking } from "@/http/bookingService";
import Register from "../screens/Register";
import ArtistProfile from "../screens/ArtistProfile";
import CreateEvent from "../screens/CreateEvent";
import EventDetail from "../screens/EventDetail";
import ForgotPassword from "../screens/ForgotPassword";
import HomePage from "../screens/HomePage";
import InfoEvent from "../screens/InfoEvent";
import Initial from "../screens/Initial";
import Login from "../screens/Login";
import Profile from "../screens/Profile";
import RoleSelection from "../screens/RoleSelection";
import Schedulling from "../screens/Schedulling";
import SearchArtists from "../screens/SearchArtists";

// Artista — onboarding
import OnboardingArtistProfile from "../screens/OnboardingArtistProfile";
import OnboardingArtistBio from "../screens/OnboardingArtistBio";

// Artista — register
import RegisterArtist from "../screens/artist/RegisterArtist";

// Artista — navigator (bottom tabs + detail stack)
import ArtistNavigator from "./ArtistNavigator";

// Usuário comum — navigator e onboarding
import UserNavigator from "./UserNavigator";
import UserOnboardingGenres from "../screens/user/UserOnboardingGenres";
import UserOnboardingLocation from "../screens/user/UserOnboardingLocation";

// Estabelecimento — onboarding
import OnboardingEstIdentidade from "../screens/OnboardingEstIdentidade";
import OnboardingEstFuncionamento from "../screens/OnboardingEstFuncionamento";
import OnboardingEstPerfil from "../screens/OnboardingEstPerfil";
import OnboardingEstApresentacao from "../screens/OnboardingEstApresentacao";

// Estabelecimento — navigator (bottom tabs + detail stack)
import EstablishmentNavigator from "./EstablishmentNavigator";

export type RootStackParamList = {
  // Antes do login
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  RoleSelection: undefined;

  // Estabelecimento — onboarding
  OnboardingEstIdentidade: undefined;
  OnboardingEstFuncionamento: { nome: string; tipo: string; telefone: string };
  OnboardingEstPerfil: { nome: string; tipo: string; telefone: string; endereco: string; numero: string; cidade: string; estado: string; diasHorarios: string };
  OnboardingEstApresentacao: { nome: string; tipo: string; telefone: string; endereco: string; numero: string; cidade: string; estado: string; diasHorarios: string; generos: string; temEstrutura: boolean; estrutura: string; capacidade: string };

  // Estabelecimento — app principal
  EstablishmentNavigator: undefined;

  // Artista — registro e onboarding
  RegisterArtist: undefined;
  OnboardingArtistProfile: undefined;
  OnboardingArtistBio: {
    nome: string;
    tipo: string;
    generos: string[];
    cacheMin: string;
    cacheMax: string;
    temEstrutura: boolean;
    estrutura: string[];
    fotoUri?: string;
  };

  // Artista — app principal (bottom tabs + detail stack encapsulados)
  ArtistNavigator: undefined;

  // Usuário comum — onboarding e app principal
  UserOnboardingGenres: undefined;
  UserOnboardingLocation: { generos: string[] };
  UserNavigator: undefined;

  // Estabelecimento — app
  HomePage: undefined;
  Schedulling: undefined;
  CreateEvent: undefined;
  InfoEvent: undefined;
  ArtistProfile: undefined;
  Profile: undefined;
  EventDetail: { event: Booking };
  SearchArtists: undefined;

  // Legado (manter para não quebrar imports existentes)
  ArtistHome: undefined;
  BrowseEvents: undefined;
  EventDetailArtist: { eventId: number };
  MyBands: undefined;
  CreateBand: undefined;
  EditBand: { bandId: number };
  BandDetail: { bandId: number };
  MyContracts: undefined;
  ArtistProfileEdit: undefined;
  ApplyConfirmation: {
    eventId: number;
    eventName: string;
    date: string;
    time: string;
    cache: string;
  };
  ShowDetail: { contractId: number };
  ContractDetail: { contractId: number };
  RateEstablishment: { contractId: number; venueName: string };
  Subscription: undefined;
  MyApplications: undefined;
  ArtistSchedule: undefined;
  ArtistEPK: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigate() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      {/* Telas de autenticação */}
      <Stack.Screen name="Initial" component={Initial} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="RoleSelection" component={RoleSelection} />

      {/* Estabelecimento — onboarding */}
      <Stack.Screen name="OnboardingEstIdentidade" component={OnboardingEstIdentidade} />
      <Stack.Screen name="OnboardingEstFuncionamento" component={OnboardingEstFuncionamento} />
      <Stack.Screen name="OnboardingEstPerfil" component={OnboardingEstPerfil} />
      <Stack.Screen name="OnboardingEstApresentacao" component={OnboardingEstApresentacao} />

      {/* Estabelecimento — app principal */}
      <Stack.Screen name="EstablishmentNavigator" component={EstablishmentNavigator} />

      {/* Artista — registro e onboarding */}
      <Stack.Screen name="RegisterArtist" component={RegisterArtist} />
      <Stack.Screen name="OnboardingArtistProfile" component={OnboardingArtistProfile} />
      <Stack.Screen name="OnboardingArtistBio" component={OnboardingArtistBio} />

      {/* Artista — app principal */}
      <Stack.Screen name="ArtistNavigator" component={ArtistNavigator} />

      {/* Usuário comum — onboarding e app principal */}
      <Stack.Screen name="UserOnboardingGenres" component={UserOnboardingGenres} />
      <Stack.Screen name="UserOnboardingLocation" component={UserOnboardingLocation} />
      <Stack.Screen name="UserNavigator" component={UserNavigator} />

      {/* Estabelecimento — app principal */}
      <Stack.Screen name="HomePage" component={HomePage} />
      <Stack.Screen name="Schedulling" component={Schedulling} />
      <Stack.Screen name="CreateEvent" component={CreateEvent} />
      <Stack.Screen name="InfoEvent" component={InfoEvent} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfile} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EventDetail" component={EventDetail} />
      <Stack.Screen name="SearchArtists" component={SearchArtists} />
    </Stack.Navigator>
  );
}
