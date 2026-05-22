import React from "react";
import { View, Text, Switch, TextInput, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";
import { WEEK_DAYS } from "../constants";
import { WeekSchedule } from "../context/types";

interface Props {
  schedule: WeekSchedule;
  onToggleDay: (id: string) => void;
  onUpdateTime: (id: string, field: "inicio" | "fim", value: string) => void;
}

export default function WeekScheduleEditor({ schedule, onToggleDay, onUpdateTime }: Props) {
  return (
    <View>
      {WEEK_DAYS.map((dia) => {
        const d = schedule[dia.id];
        if (!d) return null;
        return (
          <View key={dia.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>{dia.label}</Text>
              <Switch
                value={d.ativo}
                onValueChange={() => onToggleDay(dia.id)}
                trackColor={{ false: colors.inputBorder, true: colors.purplePrimary }}
                thumbColor={colors.white}
              />
            </View>
            {d.ativo && (
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>INÍCIO</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={d.inicio}
                    onChangeText={(v) => onUpdateTime(dia.id, "inicio", v)}
                    placeholder="18:00"
                    placeholderTextColor={colors.placeholder}
                    textAlign="center"
                  />
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>FIM</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={d.fim}
                    onChangeText={(v) => onUpdateTime(dia.id, "fim", v)}
                    placeholder="02:00"
                    placeholderTextColor={colors.placeholder}
                    textAlign="center"
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: colors.white,
    letterSpacing: 1.5,
  },
  timeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  timeField: {
    flex: 1,
  },
  timeLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 6,
  },
  timeInput: {
    backgroundColor: colors.purpleBlack2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
});
