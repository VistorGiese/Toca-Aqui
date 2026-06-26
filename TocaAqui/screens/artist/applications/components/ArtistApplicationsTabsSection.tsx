import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { APPLICATION_TABS, TAB_COLORS } from "../constants";
import { styles } from "../styles";
import { ApplicationTab } from "../types";

interface Props {
  activeTab: ApplicationTab;
  onChange: (tab: ApplicationTab) => void;
}

export default function ArtistApplicationsTabsSection({ activeTab, onChange }: Props) {
  return (
    <View style={styles.tabRow}>
      {APPLICATION_TABS.map((tab) => {
        const active = activeTab === tab;
        const tabColor = TAB_COLORS[tab];
        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              active && { borderColor: tabColor, backgroundColor: tabColor + "22" },
            ]}
            onPress={() => onChange(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, active && { color: tabColor }]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
