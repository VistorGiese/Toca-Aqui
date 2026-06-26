import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";

import ArtistHome from "@/screens/artist/home";
import ArtistBrowseEvents from "@/screens/artist/browse-events";
import ArtistSchedule from "@/screens/artist/schedule";
import ArtistApplications from "@/screens/artist/applications";
import ArtistProfile from "@/screens/artist/profile";
import ArtistEditProfile from "@/screens/artist/edit-profile";

import ArtistEventDetail from "@/screens/artist/event-detail";
import ArtistApplyConfirmation from "@/screens/artist/apply-confirmation";
import ArtistShowDetail from "@/screens/artist/show-detail";
import ArtistContractDetail from "@/screens/artist/contract-detail";
import MyContracts from "@/screens/artist/my-contracts";
import RateEstablishment from "@/screens/artist/rate-establishment";
import ArtistSubscription from "@/screens/artist/subscription";
import ArtistUpcomingShowDetail from "@/screens/artist/upcoming-show-detail";
import ArtistAllConfirmedShows from "@/screens/artist/all-confirmed-shows";
import UserArtistProfile from "@/screens/user/artist-profile";
import UserEstablishmentProfile from "@/screens/user/establishment-profile";
import ArtistNotifications from "@/screens/artist/notifications";
import ArtistMyBands from "@/screens/artist/my-bands";
import ArtistCreateBand from "@/screens/artist/create-band";
import ArtistEditBand from "@/screens/artist/edit-band";
import ArtistBandDetail from "@/screens/artist/band-detail";

const DS = {
  bg: "#09090F",
  accent: "#6C5CE7",
  textDis: "#555577",
  bgSurface: "#1A1040",
};

export type ArtistTabParamList = {
  ArtistHome: undefined;
  BrowseEvents: undefined;
  ArtistSchedule: undefined;
  MyApplications: undefined;
  ArtistEPK: undefined;
};

export type ArtistStackParamList = {
  ArtistTabs: undefined;
  EventDetailArtist: { eventId: number };
  ApplyConfirmation: {
    eventId: number;
    eventName: string;
    date: string;
    time: string;
    cache: string;
  };
  ShowDetail: { contractId: number };
  ContractDetail: { contractId: number };
  ArtistUpcomingShowDetail: {
    nomeEvento: string;
    nomeArtista?: string;
    fotoArtista?: string;
    horarioInicio: string;
    horarioFim?: string;
    dataShow: string;
  };
  ArtistAllConfirmedShows: undefined;
  MyContracts: undefined;
  RateEstablishment: { contractId: number; venueName: string };
  Subscription: undefined;
  ArtistProfileManage: undefined;
  ArtistNotifications: undefined;
  UserArtistProfile: { artistId: number; profile?: import("@/utils/artistProfile").ArtistProfileSnapshot; canBuyTickets?: boolean };
  UserEstablishmentProfile: {
    establishmentId: number;
    canBuyTickets?: boolean;
    viewerContext?: "establishment" | "user";
  };
  MyBands: undefined;
  CreateBand: undefined;
  EditBand: { bandId: number };
  BandDetail: { bandId: number };
};

const Tab = createBottomTabNavigator<ArtistTabParamList>();
const Stack = createNativeStackNavigator<ArtistStackParamList>();

function ArtistTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DS.bg,
          borderTopColor: DS.bgSurface,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: DS.accent,
        tabBarInactiveTintColor: DS.textDis,
        tabBarLabelStyle: {
          fontFamily: "Montserrat-SemiBold",
          fontSize: 9,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="ArtistHome"
        component={ArtistHome}
        options={{
          tabBarLabel: "HOME",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BrowseEvents"
        component={ArtistBrowseEvents}
        options={{
          tabBarLabel: "VAGAS",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="guitar" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ArtistSchedule"
        component={ArtistSchedule}
        options={{
          tabBarLabel: "AGENDA",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="calendar-alt" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyApplications"
        component={ArtistApplications}
        options={{
          tabBarLabel: "CANDIDATURAS",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="file-alt" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ArtistEPK"
        component={ArtistProfile}
        options={{
          tabBarLabel: "PERFIL",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size - 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function ArtistNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ArtistTabs" component={ArtistTabs} />
      <Stack.Screen name="EventDetailArtist" component={ArtistEventDetail} />
      <Stack.Screen name="ApplyConfirmation" component={ArtistApplyConfirmation} />
      <Stack.Screen name="ShowDetail" component={ArtistShowDetail} />
      <Stack.Screen name="ContractDetail" component={ArtistContractDetail} />
      <Stack.Screen name="ArtistUpcomingShowDetail" component={ArtistUpcomingShowDetail} />
      <Stack.Screen name="ArtistAllConfirmedShows" component={ArtistAllConfirmedShows} />
      <Stack.Screen name="MyContracts" component={MyContracts} />
      <Stack.Screen name="RateEstablishment" component={RateEstablishment} />
      <Stack.Screen name="Subscription" component={ArtistSubscription} />
      <Stack.Screen name="ArtistProfileManage" component={ArtistEditProfile} />
      <Stack.Screen name="ArtistNotifications" component={ArtistNotifications} />
      <Stack.Screen name="UserArtistProfile" component={UserArtistProfile} />
      <Stack.Screen name="UserEstablishmentProfile" component={UserEstablishmentProfile} />
      <Stack.Screen name="MyBands" component={ArtistMyBands} />
      <Stack.Screen name="CreateBand" component={ArtistCreateBand} />
      <Stack.Screen name="EditBand" component={ArtistEditBand} />
      <Stack.Screen name="BandDetail" component={ArtistBandDetail} />
    </Stack.Navigator>
  );
}
