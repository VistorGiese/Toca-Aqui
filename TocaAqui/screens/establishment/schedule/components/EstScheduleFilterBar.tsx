import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SCHEDULE_FILTERS, ScheduleFilter } from "../constants";
import { styles } from "../styles";

interface Props {
  filter: ScheduleFilter;
  onChange: (filter: ScheduleFilter) => void;
}

export default function EstScheduleFilterBar({ filter, onChange }: Props) {
  return (
    <View style={styles.filterRow}>
      {SCHEDULE_FILTERS.map((item) => {
        const active = filter === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.filterChip, active && styles.filterChipActive]}
            onPress={() => onChange(item.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
