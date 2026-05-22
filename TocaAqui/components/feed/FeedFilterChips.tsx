import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "@/utils/colors";
import { FeedFilter } from "@/screens/user/feed/types";

interface FeedFilterChipsProps {
  filters: readonly FeedFilter[];
  active: FeedFilter;
  onChange: (filter: FeedFilter) => void;
}

export default function FeedFilterChips({ filters, active, onChange }: FeedFilterChipsProps) {
  return (
    <>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[styles.chip, active === filter && styles.chipActive]}
          onPress={() => onChange(filter)}
        >
          <Text style={[styles.chipText, active === filter && styles.chipTextActive]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.surfaceBorderStrong,
  },
  chipActive: {
    backgroundColor: colors.purplePrimarySoft,
    borderColor: colors.purpleLight,
  },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.purpleLight,
  },
});
