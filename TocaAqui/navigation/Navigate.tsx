import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinkingOptions } from "@react-navigation/native";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

import Initial from "@/screens/initial";
import Login from "@/screens/login";
import Register from "@/screens/register";
import ForgotPassword from "@/screens/forgot-password";
import VerifyEmail from "@/screens/verify-email";
import ResetPassword from "@/screens/reset-password";

import OnboardingArtistProfile from "@/screens/artist/onboarding/profile";
import OnboardingArtistBio from "@/screens/artist/onboarding/bio";
import RegisterArtist from "@/screens/artist/register";

import ArtistNavigator from "./ArtistNavigator";

import UserNavigator from "./UserNavigator";
import UserOnboardingGenres from "@/screens/user/onboarding/genres";
import UserOnboardingLocation from "@/screens/user/onboarding/location";

import { EstablishmentOnboardingNavigator } from "../screens/establishment/onboarding";

import EstablishmentNavigator from "./EstablishmentNavigator";
import { resolveAppRoute } from "./resolveAppRoute";

export type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { token: string };
  ResetPassword: { token: string };

  EstablishmentOnboarding: undefined;
  /** @deprecated Use EstablishmentOnboarding — mantido para compatibilidade de deep links */
  OnboardingEstIdentidade: undefined;

  EstablishmentNavigator: undefined;

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

  ArtistNavigator: undefined;

  UserOnboardingGenres: undefined;
  UserOnboardingLocation: { generos: string[] };
  UserNavigator: undefined;

  ArtistHome: undefined;
  BrowseEvents: undefined;
  EventDetailArtist: { eventId: number };
  MyBands: undefined;
  CreateBand: undefined;
  EditBand: { bandId: number };
  BandDetail: { bandId: number };
  MyContracts: undefined;
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

export default function Navigate() {
  const { isAuthenticated, isLoading, user, paginas } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#09090F", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  const initialRoute = resolveAppRoute(user, paginas);

  return (
    <Stack.Navigator key={isAuthenticated ? "app" : "auth"} initialRouteName={isAuthenticated ? initialRoute : "Login"} screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Initial" component={Initial} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="RegisterArtist" component={RegisterArtist} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      ) : (
        <>
          <Stack.Screen name="UserNavigator" component={UserNavigator} />
          <Stack.Screen name="UserOnboardingGenres" component={UserOnboardingGenres} />
          <Stack.Screen name="UserOnboardingLocation" component={UserOnboardingLocation} />

          <Stack.Screen name="EstablishmentNavigator" component={EstablishmentNavigator} />
          <Stack.Screen name="EstablishmentOnboarding" component={EstablishmentOnboardingNavigator} />
          <Stack.Screen name="OnboardingEstIdentidade" component={EstablishmentOnboardingNavigator} />

          <Stack.Screen name="ArtistNavigator" component={ArtistNavigator} />
          <Stack.Screen name="OnboardingArtistProfile" component={OnboardingArtistProfile} />
          <Stack.Screen name="OnboardingArtistBio" component={OnboardingArtistBio} />
        </>
      )}
    </Stack.Navigator>
  );
}
