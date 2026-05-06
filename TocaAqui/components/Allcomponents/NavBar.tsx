import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/utils/colors";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";

export default function NavBar() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [userRole, setUserRole] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadRole = async () => {
        const role = await AsyncStorage.getItem("userRole");
        setUserRole(role);
      };

      loadRole();
    }, [])
  );

  const currentSection =
    route.name === "HomePage"
      ? "home"
      : route.name === "Schedulling"
        ? "calendar"
        : route.name === "CreateEvent" || route.name === "ArtistFavorites"
          ? "favorites"
          : route.name === "ArtistProfile" ||
              route.name === "ArtistSelfProfile" ||
              route.name === "Profile"
            ? "profile"
            : "";

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja mesmo sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["token", "estabelecimentoId", "userRole"]);
          navigation.replace("Login");
        },
      },
    ]);
  };

  const handlePress = (id: string) => {
    switch (id) {
      case "home":
        navigation.navigate("HomePage");
        break;
      case "calendar":
        navigation.navigate("Schedulling");
        break;
      case "favorites":
        if (userRole === "artist") {
          navigation.navigate("ArtistFavorites");
          break;
        }
        navigation.navigate("CreateEvent");
        break;
      case "profile":
        if (userRole === "artist") {
          navigation.navigate("ArtistSelfProfile");
          break;
        }
        navigation.navigate("Profile");
        break;
      case "logout":
        handleLogout();
        break;
    }
  };

  const navItems = [
    { id: "home", icon: "house", text: "Início", type: "FontAwesome6" },
    {
      id: "calendar",
      icon: "calendar-day",
      text: "Agenda",
      type: "FontAwesome6",
    },
    { id: "favorites", icon: "star", text: "Favoritos", type: "FontAwesome" },
    { id: "profile", icon: "user", text: "Perfil", type: "FontAwesome" },
  ];

  const commonUserNavItems = [
    { id: "home", icon: "house", text: "Início", type: "FontAwesome6" },
    { id: "logout", icon: "sign-out", text: "Sair", type: "FontAwesome" },
  ];

  const artistNavItems = [
    { id: "home", icon: "house", text: "Início", type: "FontAwesome6" },
    { id: "favorites", icon: "star", text: "Favoritos", type: "FontAwesome" },
    { id: "profile", icon: "user", text: "Perfil", type: "FontAwesome" },
  ];

  const visibleNavItems =
    userRole === "common_user"
      ? commonUserNavItems
      : userRole === "artist"
        ? artistNavItems
        : navItems;

  return (
    <View style={styles.container}>
      {visibleNavItems.map((item) => {
        const isSelected = currentSection === item.id;

        return (
          <Pressable
            key={item.id}
            onPress={() => handlePress(item.id)}
            style={[styles.containerItem, isSelected && styles.selectedItem]}
          >
            {item.type === "FontAwesome6" ? (
              <FontAwesome6
                name={item.icon}
                size={18}
                color={isSelected ? colors.purpleBlack : "white"}
              />
            ) : (
              <FontAwesome
                name={item.icon}
                size={20}
                color={isSelected ? colors.purpleBlack : "white"}
              />
            )}
            {isSelected && <Text style={styles.text}>{item.text}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#07010C",
    padding: "8%",
    flexDirection: "row",
    width: "120%",
    justifyContent: "space-around",
    bottom: 0,
    position: "absolute",
    zIndex: 2,
  },
  containerItem: {
    flexDirection: "row",
    gap: 6,
    padding: 10,
    borderRadius: 20,
  },
  selectedItem: {
    backgroundColor: "white",
  },
  text: {
    color: colors.purpleBlack,
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
});
