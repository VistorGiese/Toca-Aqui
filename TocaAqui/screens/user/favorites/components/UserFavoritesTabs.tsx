import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TABS } from "../constants";
import { styles } from "../styles";
import { FavoritesTab } from "../types";

type Props = {
  activeTab: FavoritesTab;
  onTabChange: (tab: FavoritesTab) => void;
};

export default function UserFavoritesTabs({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.tabsRow}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
