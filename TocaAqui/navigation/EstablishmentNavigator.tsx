import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";

import EstHome from "@/screens/establishment/home";
import EstGigs from "@/screens/establishment/gigs";
import EstSearch from "@/screens/establishment/search";
import EstSchedule from "@/screens/establishment/schedule";
import EstProfile from "@/screens/establishment/profile";

import EstNewGig from "@/screens/establishment/new-gig";
import EstGigApplications from "@/screens/establishment/gig-applications";
import EstArtistProfile from "@/screens/establishment/artist-profile";
import EstAcceptContract from "@/screens/establishment/accept-contract";
import EstContractPreview from "@/screens/establishment/contract-preview";
import EstShowDetail from "@/screens/establishment/show-detail";
import EstNotifications from "@/screens/establishment/notifications";
import EstRateArtist from "@/screens/establishment/rate-artist";
import EstSettings from "@/screens/establishment/settings";
import EstEditProfile from "@/screens/establishment/edit-profile";
import EstUpcomingShowDetail from "@/screens/establishment/upcoming-show-detail";
import EstAllConfirmedShows from "@/screens/establishment/all-confirmed-shows";
import UserEstablishmentProfile from "@/screens/user/establishment-profile";
import { ArtistProfileSnapshot } from "@/utils/artistProfile";

const DS = {
  bg: "#09090F",
  border: "#2D2545",
  accent: "#7B61FF",
  textDisabled: "#555577",
};

export type EstTabParamList = {
  EstHome: undefined;
  EstGigs: undefined;
  EstSearch: undefined;
  EstSchedule: undefined;
  EstProfile: undefined;
};

export type EstStackParamList = {
  EstTabs: undefined;
  EstNewGig: { gigId?: number; artistaConvidadoId?: number };
  EstGigApplications: { gigId: number; gigTitle: string };
  EstArtistProfile: { artistId?: number; bandaId?: number; profile?: ArtistProfileSnapshot };
  EstAcceptContract: {
    applicationId: number;
    gigId: number;
    status: "pendente" | "aceito" | "rejeitado";
    artistaId?: number;
    bandaId?: number;
    artistName: string;
    gigTitle: string;
    valorProposto?: number;
    mensagem?: string;
    eventClosed?: boolean;
  };
  EstContractPreview: {
    contractId: number;
    artistName: string;
    gigTitle: string;
    eventoId: number;
    initialContract?: Record<string, unknown>;
  };
  EstShowDetail: { contractId: number };
  EstUpcomingShowDetail: {
    nomeEvento: string;
    nomeArtista?: string;
    fotoArtista?: string;
    horarioInicio: string;
    horarioFim?: string;
    dataShow: string;
  };
  EstAllConfirmedShows: undefined;
  EstNotifications: undefined;
  EstRateArtist: { contractId: number; artistName: string; showDate: string };
  EstSettings: undefined;
  EstEditProfile: undefined;
  UserEstablishmentProfile: {
    establishmentId: number;
    canBuyTickets?: boolean;
    viewerContext?: "establishment" | "user";
  };
};

const Tab = createBottomTabNavigator<EstTabParamList>();
const Stack = createNativeStackNavigator<EstStackParamList>();

function EstablishmentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DS.bg,
          borderTopColor: DS.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: DS.accent,
        tabBarInactiveTintColor: DS.textDisabled,
        tabBarLabelStyle: {
          fontFamily: "Montserrat-SemiBold",
          fontSize: 9,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="EstHome"
        component={EstHome}
        options={{
          tabBarLabel: "HOME",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="EstGigs"
        component={EstGigs}
        options={{
          tabBarLabel: "VAGAS",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="briefcase" size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="EstSearch"
        component={EstSearch}
        options={{
          tabBarLabel: "BUSCAR",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="search" size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="EstSchedule"
        component={EstSchedule}
        options={{
          tabBarLabel: "AGENDA",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="calendar-alt" size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="EstProfile"
        component={EstProfile}
        options={{
          tabBarLabel: "PERFIL",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="user" size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function EstablishmentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EstTabs" component={EstablishmentTabs} />
      <Stack.Screen name="EstNewGig" component={EstNewGig} />
      <Stack.Screen name="EstGigApplications" component={EstGigApplications} />
      <Stack.Screen name="EstArtistProfile" component={EstArtistProfile} />
      <Stack.Screen name="EstAcceptContract" component={EstAcceptContract} />
      <Stack.Screen name="EstContractPreview" component={EstContractPreview} />
      <Stack.Screen name="EstShowDetail" component={EstShowDetail} />
      <Stack.Screen name="EstUpcomingShowDetail" component={EstUpcomingShowDetail} />
      <Stack.Screen name="EstAllConfirmedShows" component={EstAllConfirmedShows} />
      <Stack.Screen name="EstNotifications" component={EstNotifications} />
      <Stack.Screen name="EstRateArtist" component={EstRateArtist} />
      <Stack.Screen name="EstSettings" component={EstSettings} />
      <Stack.Screen name="EstEditProfile" component={EstEditProfile} />
      <Stack.Screen name="UserEstablishmentProfile" component={UserEstablishmentProfile} />
    </Stack.Navigator>
  );
}
