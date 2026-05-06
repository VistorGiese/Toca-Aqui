import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";

import UserFeed from "@/screens/user/UserFeed";
import UserSearch from "@/screens/user/UserSearch";
import UserTickets from "@/screens/user/UserTickets";
import UserFavorites from "@/screens/user/UserFavorites";
import UserProfile from "@/screens/user/UserProfile";

import UserShowDetail from "@/screens/user/UserShowDetail";
import UserCheckout from "@/screens/user/UserCheckout";
import UserPurchaseConfirmation from "@/screens/user/UserPurchaseConfirmation";
import UserTicketDetail from "@/screens/user/UserTicketDetail";
import UserArtistProfile from "@/screens/user/UserArtistProfile";
import UserRateShow from "@/screens/user/UserRateShow";
import UserComments from "@/screens/user/UserComments";
import UserSettings from "@/screens/user/UserSettings";
import UserNotifications from "@/screens/user/UserNotifications";

const DS = {
  bg: "#09090F",
  accent: "#A78BFA",
  textDis: "#555577",
  bgSurface: "#1A1040",
};

export type UserTabParamList = {
  UserFeed: undefined;
  UserSearch: undefined;
  UserTickets: undefined;
  UserFavorites: undefined;
  UserProfile: undefined;
};

export type UserStackParamList = {
  UserTabs: undefined;
  // Tab routes (accessible via stack navigator for cross-navigation)
  UserFeed: undefined;
  UserSearch: undefined;
  UserTickets: undefined;
  UserFavorites: undefined;
  UserProfile: undefined;
  // Detail screens
  UserShowDetail: { showId: number };
  UserCheckout: {
    showId: number;
    showTitle: string;
    showDate: string;
    venue: string;
    imageUrl?: string;
  };
  UserPurchaseConfirmation: {
    showTitle: string;
    showDate: string;
    venue: string;
    price: number;
    buyerName: string;
  };
  UserTicketDetail: { ticketId: number };
  UserArtistProfile: { artistId: number };
  UserRateShow: { showId: number; showTitle: string; venueName: string };
  UserComments: { showId: number; showTitle: string };
  UserSettings: undefined;
  UserNotifications: undefined;
};

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createNativeStackNavigator<UserStackParamList>();

function UserTabs() {
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
        name="UserFeed"
        component={UserFeed}
        options={{
          tabBarLabel: "FEED",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserSearch"
        component={UserSearch}
        options={{
          tabBarLabel: "BUSCAR",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="search" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserTickets"
        component={UserTickets}
        options={{
          tabBarLabel: "INGRESSOS",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="ticket-alt" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserFavorites"
        component={UserFavorites}
        options={{
          tabBarLabel: "FAVORITOS",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="heart" size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfile}
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

export default function UserNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabs} />
      <Stack.Screen name="UserShowDetail" component={UserShowDetail} />
      <Stack.Screen name="UserCheckout" component={UserCheckout} />
      <Stack.Screen name="UserPurchaseConfirmation" component={UserPurchaseConfirmation} />
      <Stack.Screen name="UserTicketDetail" component={UserTicketDetail} />
      <Stack.Screen name="UserArtistProfile" component={UserArtistProfile} />
      <Stack.Screen name="UserRateShow" component={UserRateShow} />
      <Stack.Screen name="UserComments" component={UserComments} />
      <Stack.Screen name="UserSettings" component={UserSettings} />
      <Stack.Screen name="UserNotifications" component={UserNotifications} />
    </Stack.Navigator>
  );
}
