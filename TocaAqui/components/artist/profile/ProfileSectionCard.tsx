import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/utils/colors";

type Props = {
  title: string;
  editable?: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
  hint?: string;
};

export default function ProfileSectionCard({ title, editable, onEdit, children, hint }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
        {editable && onEdit ? (
          <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.85}>
            <FontAwesome5 name="pen" size={11} color={colors.purpleLight} />
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16163A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  titleWrap: { flex: 1 },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: colors.white,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  hint: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accentSoftBg,
    borderWidth: 1,
    borderColor: colors.accentBorderSoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: colors.purpleLight,
  },
});
