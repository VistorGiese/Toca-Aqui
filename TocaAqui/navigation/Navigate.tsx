import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { Booking } from "@/http/bookingService";
import AdditionalInformation from "../screens/AdditionalInformation";
import Register from "../screens/Register";
import ArtistProfile from "../screens/ArtistProfile";
import ConfirmRegister from "../screens/ConfirmRegister";
import CreateEvent from "../screens/CreateEvent";
import EventDetail from "../screens/EventDetail";
import ForgotPassword from "../screens/ForgotPassword";
import HomePage from "../screens/HomePage";
import InfoEvent from "../screens/InfoEvent";
import InformationPersonResponsible from "../screens/InformationPersonResponsible";
import Initial from "../screens/Initial";
import Login from "../screens/Login";
import Profile from "../screens/Profile";
import RegisterLocationAndress from "../screens/RegisterLocationAndress";
import RegisterLocationName from "../screens/RegisterLocationName";
import RegisterPassword from "../screens/RegisterPassword";
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

export type RootStackParamList = {
  // Antes do login
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  RoleSelection: undefined;

  // Registro de estabelecimento
  RegisterLocationName: undefined;
  RegisterLocationAndress: undefined;
  RegisterPassword: undefined;
  InformationPersonResponsible: undefined;
  AdditionalInformation: undefined;
  ConfirmRegister: undefined;

  // Artista — registro e onboarding
  RegisterArtist: undefined;
  OnboardingArtistProfile: undefined;
  OnboardingArtistBio: {
    nome: string;
    tipo: string;
    generos: string[];
    cacheMin: string;
    cacheMax: string;
    estruturaSom: boolean;
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

      {/* Registro de estabelecimento */}
      <Stack.Group>
        <Stack.Screen name="RegisterLocationName" component={RegisterLocationName} />
        <Stack.Screen name="RegisterLocationAndress" component={RegisterLocationAndress} />
        <Stack.Screen name="RegisterPassword" component={RegisterPassword} />
        <Stack.Screen name="InformationPersonResponsible" component={InformationPersonResponsible} />
        <Stack.Screen name="AdditionalInformation" component={AdditionalInformation} />
        <Stack.Screen name="ConfirmRegister" component={ConfirmRegister} />
      </Stack.Group>

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
