import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinkingOptions } from "@react-navigation/native";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

import { Booking } from "@/http/bookingService";
import Register from "../screens/Register";
import VerifyEmail from "../screens/VerifyEmail";
import ResetPassword from "../screens/ResetPassword";
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
import ArtistProfileEdit from "../screens/artist/ArtistProfileEdit";

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
  VerifyEmail: { token: string };
  ResetPassword: { token: string };

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

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["tocaaqui://"],
  config: {
    screens: {
      VerifyEmail: "verificar-email",
      ResetPassword: "redefinir-senha",
    },
  },
};

function getInitialRoute(user: import("@/types").User | null, paginas: import("@/types").MinhasPaginas | null): keyof RootStackParamList {
  if (!user) return "UserNavigator";
  const hasArtistProfile = user.role === "artist" || !!user.perfilArtistaId || !!paginas?.pagina_artista;
  if (hasArtistProfile) return "ArtistNavigator";
  const hasEstProfile = user.role === "establishment" || !!paginas?.pagina_estabelecimento;
  if (hasEstProfile) return "EstablishmentNavigator";
  return "UserNavigator";
}

export default function Navigate() {
  const { isAuthenticated, isLoading, user, paginas } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#09090F", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  const initialRoute = getInitialRoute(user, paginas);

  return (
    <Stack.Navigator key={isAuthenticated ? "app" : "auth"} initialRouteName={isAuthenticated ? initialRoute : "Login"} screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          {/* Telas de autenticação */}
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Initial" component={Initial} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="RoleSelection" component={RoleSelection} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      ) : (
        <>
          {/* Usuário comum — onboarding e app principal */}
          <Stack.Screen name="UserNavigator" component={UserNavigator} />
          <Stack.Screen name="UserOnboardingGenres" component={UserOnboardingGenres} />
          <Stack.Screen name="UserOnboardingLocation" component={UserOnboardingLocation} />

          {/* Estabelecimento — onboarding e app */}
          <Stack.Screen name="EstablishmentNavigator" component={EstablishmentNavigator} />
          <Stack.Screen name="OnboardingEstIdentidade" component={OnboardingEstIdentidade} />
          <Stack.Screen name="OnboardingEstFuncionamento" component={OnboardingEstFuncionamento} />
          <Stack.Screen name="OnboardingEstPerfil" component={OnboardingEstPerfil} />
          <Stack.Screen name="OnboardingEstApresentacao" component={OnboardingEstApresentacao} />

          {/* Artista — registro, onboarding e app */}
          <Stack.Screen name="ArtistNavigator" component={ArtistNavigator} />
          <Stack.Screen name="RegisterArtist" component={RegisterArtist} />
          <Stack.Screen name="OnboardingArtistProfile" component={OnboardingArtistProfile} />
          <Stack.Screen name="OnboardingArtistBio" component={OnboardingArtistBio} />
          <Stack.Screen name="ArtistProfileEdit" component={ArtistProfileEdit} />

          {/* Legado */}
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="Schedulling" component={Schedulling} />
          <Stack.Screen name="CreateEvent" component={CreateEvent} />
          <Stack.Screen name="InfoEvent" component={InfoEvent} />
          <Stack.Screen name="ArtistProfile" component={ArtistProfile} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="EventDetail" component={EventDetail} />
          <Stack.Screen name="SearchArtists" component={SearchArtists} />
        </>
      )}
    </Stack.Navigator>
  );
}
