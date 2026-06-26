import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FILTER_TABS } from "../constants";
import { styles } from "../styles";
import { FilterTab } from "../types";

interface Props {
  activeTab: FilterTab;
  onChange: (tab: FilterTab) => void;
}

export default function ArtistBrowseEventsFilterTabs({ activeTab, onChange }: Props) {
  return (
    <View style={styles.tabRow}>
      {FILTER_TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => onChange(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
