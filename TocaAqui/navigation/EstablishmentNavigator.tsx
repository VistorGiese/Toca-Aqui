import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";

import EstHome from "@/screens/establishment/EstHome";
import EstGigs from "@/screens/establishment/EstGigs";
import EstSearch from "@/screens/establishment/EstSearch";
import EstSchedule from "@/screens/establishment/EstSchedule";
import EstProfile from "@/screens/establishment/EstProfile";

import EstNewGig from "@/screens/establishment/EstNewGig";
import EstGigApplications from "@/screens/establishment/EstGigApplications";
import EstArtistProfile from "@/screens/establishment/EstArtistProfile";
import EstAcceptContract from "@/screens/establishment/EstAcceptContract";
import EstShowDetail from "@/screens/establishment/EstShowDetail";
import EstNotifications from "@/screens/establishment/EstNotifications";
import EstRateArtist from "@/screens/establishment/EstRateArtist";
import EstSettings from "@/screens/establishment/EstSettings";
import EstEditProfile from "@/screens/establishment/EstEditProfile";

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
  EstArtistProfile: { artistId: number };
  EstAcceptContract: { applicationId: number; artistId?: number; artistName: string; gigTitle: string; valorProposto?: number };
  EstShowDetail: { contractId: number };
  EstNotifications: undefined;
  EstRateArtist: { contractId: number; artistName: string; showDate: string };
  EstSettings: undefined;
  EstEditProfile: undefined;
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
      <Stack.Screen name="EstShowDetail" component={EstShowDetail} />
      <Stack.Screen name="EstNotifications" component={EstNotifications} />
      <Stack.Screen name="EstRateArtist" component={EstRateArtist} />
      <Stack.Screen name="EstSettings" component={EstSettings} />
      <Stack.Screen name="EstEditProfile" component={EstEditProfile} />
    </Stack.Navigator>
  );
}
