import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function UserNotifications() {
  const navigation = useNavigation();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notificações</Text>
        <View style={{ width: 18 }} />
      </View>
      <View style={s.emptyContainer}>
        <FontAwesome5 name="bell-slash" size={40} color="#555577" />
        <Text style={s.emptyText}>Nenhuma notificação por enquanto.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: { fontFamily: "Montserrat-Bold", fontSize: 17, color: "#FFFFFF" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  emptyText: { fontFamily: "Montserrat-SemiBold", fontSize: 14, color: "#555577" },
});
