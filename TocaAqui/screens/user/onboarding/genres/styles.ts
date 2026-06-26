import { StyleSheet } from "react-native";
import { DS } from "./constants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  progressRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  progressActive: { backgroundColor: DS.accent },
  progressInactive: { backgroundColor: "rgba(167,139,250,0.2)" },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleBlock: { marginBottom: 12 },
  titleWhite: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 28,
    color: DS.white,
    lineHeight: 36,
  },
  titleAccent: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 28,
    color: DS.accent,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  counterLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.textDis,
  },
  counterValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.accent,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  chipSelected: {
    backgroundColor: "rgba(167,139,250,0.15)",
    borderColor: DS.accent,
  },
  chipIcon: { marginBottom: 8 },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textDis,
    textAlign: "center",
  },
  chipTextSelected: { color: DS.accent },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: DS.bg,
  },
  nextBtn: {
    backgroundColor: DS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: DS.white,
    letterSpacing: 2,
  },
});

export const headerStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: { width: 60 },
  headerBrand: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.accent,
    letterSpacing: 2,
  },
  skipBtn: { width: 60, alignItems: "flex-end" },
  skipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.accent,
  },
});
