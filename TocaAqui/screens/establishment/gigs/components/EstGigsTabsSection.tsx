import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GIG_TABS } from "../constants";
import { GigTab } from "../types";
import { styles } from "../styles";

interface Props {
  tab: GigTab;
  onChange: (tab: GigTab) => void;
}

export default function EstGigsTabsSection({ tab, onChange }: Props) {
  return (
    <View style={styles.tabs}>
      {GIG_TABS.map((item) => {
        const active = tab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.tabBtn, active && styles.tabBtnOn]}
            onPress={() => onChange(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, active && styles.tabBtnTextOn]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
