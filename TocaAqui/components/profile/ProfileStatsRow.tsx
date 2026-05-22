import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/utils/colors";
import { ProfileStatItem } from "./types";

interface ProfileStatsRowProps {
  stats: ProfileStatItem[];
}

export default function ProfileStatsRow({ stats }: ProfileStatsRowProps) {
  return (
    <View style={styles.row}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <View style={styles.item}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
          {index < stats.length - 1 ? <View style={styles.divider} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 16,
    marginBottom: 16,
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  value: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: colors.purpleLight,
    marginBottom: 4,
  },
  label: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 14,
  },
  divider: {
    width: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
});
