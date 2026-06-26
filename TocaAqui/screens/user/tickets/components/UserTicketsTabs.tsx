import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";
import { TicketsTab } from "../types";

type Props = {
  activeTab: TicketsTab;
  onTabChange: (tab: TicketsTab) => void;
};

export default function UserTicketsTabs({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.tabsRow}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
        onPress={() => onTabChange("upcoming")}
      >
        <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
          Próximos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "past" && styles.tabActive]}
        onPress={() => onTabChange("past")}
      >
        <Text style={[styles.tabText, activeTab === "past" && styles.tabTextActive]}>
          Passados
        </Text>
      </TouchableOpacity>
    </View>
  );
}
