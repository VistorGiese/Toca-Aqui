import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { APPLICATION_TABS } from "../constants";
import { ApplicationTab } from "../types";
import { styles } from "../styles";

interface Props {
  tab: ApplicationTab;
  onChange: (tab: ApplicationTab) => void;
}

export default function EstGigApplicationsTabsSection({ tab, onChange }: Props) {
  return (
    <View style={styles.tabs}>
      {APPLICATION_TABS.map((item) => {
        const active = tab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.tabBtn, active && styles.tabBtnOn]}
            onPress={() => onChange(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, active && styles.tabTextOn]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
