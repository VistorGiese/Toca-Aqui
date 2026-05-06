import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";

import ArtistHome from "@/screens/artist/ArtistHome";
import BrowseEvents from "@/screens/artist/BrowseEvents";
import ArtistSchedule from "@/screens/artist/ArtistSchedule";
import MyApplications from "@/screens/artist/MyApplications";
import ArtistEPK from "@/screens/artist/ArtistEPK";

// Detail screens
import EventDetailArtist from "@/screens/artist/EventDetailArtist";
import ApplyConfirmation from "@/screens/artist/ApplyConfirmation";
import ShowDetail from "@/screens/artist/ShowDetail";
import ContractDetail from "@/screens/artist/ContractDetail";
import MyContracts from "@/screens/artist/MyContracts";
import RateEstablishment from "@/screens/artist/RateEstablishment";
import Subscription from "@/screens/artist/Subscription";

const DS = {
  bg: "#09090F",
  accent: "#6C5CE7",
  textDis: "#555577",
  bgSurface: "#1A1040",
};

// ---- Bottom Tab Param List ----
export type ArtistTabParamList = {
  ArtistHome: undefined;
  BrowseEvents: undefined;
  ArtistSchedule: undefined;
  MyApplications: undefined;
  ArtistEPK: undefined;
};

// ---- Stack Param List (telas de detalhe dentro do navigator) ----
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
  MyContracts: undefined;
  RateEstablishment: { contractId: number; venueName: string };
  Subscription: undefined;
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
        component={BrowseEvents}
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
        component={MyApplications}
        options={{
          tabBarLabel: "CANDIDATURAS",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="file-alt" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ArtistEPK"
        component={ArtistEPK}
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
      <Stack.Screen name="EventDetailArtist" component={EventDetailArtist} />
      <Stack.Screen name="ApplyConfirmation" component={ApplyConfirmation} />
      <Stack.Screen name="ShowDetail" component={ShowDetail} />
      <Stack.Screen name="ContractDetail" component={ContractDetail} />
      <Stack.Screen name="MyContracts" component={MyContracts} />
      <Stack.Screen name="RateEstablishment" component={RateEstablishment} />
      <Stack.Screen name="Subscription" component={Subscription} />
    </Stack.Navigator>
  );
}
