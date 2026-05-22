import React from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import { onboardingStyles as s } from "../styles";
import { SOUND_STRUCTURE_OPTIONS } from "../constants";

interface Props {
  enabled: boolean;
  selected: string[];
  onToggleEnabled: (value: boolean) => void;
  onToggleItem: (item: string) => void;
}

export default function SoundStructureSection({
  enabled,
  selected,
  onToggleEnabled,
  onToggleItem,
}: Props) {
  return (
    <View style={s.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Estrutura de Som</Text>
          <Text style={styles.sub}>O local já possui equipamentos básicos?</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggleEnabled}
          trackColor={{ false: colors.inputBorder, true: colors.purplePrimary }}
          thumbColor={colors.white}
        />
      </View>
      {enabled && (
        <View style={styles.body}>
          <Text style={s.fieldLabel}>ESTRUTURA DISPONÍVEL</Text>
          <View style={styles.grid}>
            {SOUND_STRUCTURE_OPTIONS.map((item) => {
              const checked = selected.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={styles.checkItem}
                  onPress={() => onToggleItem(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                    {checked && (
                      <MaterialCommunityIcons name="check" size={12} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.checkLabel}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 15,
    color: colors.white,
  },
  sub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  body: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "46%",
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    backgroundColor: colors.purpleBlack2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxOn: {
    borderColor: colors.purplePrimary,
    backgroundColor: colors.purplePrimary,
  },
  checkLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: colors.white,
  },
});
