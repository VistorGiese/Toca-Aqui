import { Dimensions, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";
import { DS } from "./constants";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DS.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: height * 0.06,
    paddingBottom: 20,
    backgroundColor: DS.bg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  homeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(108,92,231,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: DS.white,
    fontSize: 15,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
  },
  headerTitleAccent: {
    color: DS.cyan,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: "center",
  },
  genreLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    width: "100%",
    marginBottom: 10,
    gap: 8,
  },
  genreLabel: {
    color: DS.white,
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
    width: "100%",
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  genreChipUnselected: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  genreChipText: {
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
  },
  genreChipTextSelected: {
    color: DS.white,
  },
  genreChipTextUnselected: {
    color: DS.textSec,
  },
  submitButton: {
    width: "100%",
    height: 52,
    marginTop: 8,
  },
  submitText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: colors.purpleDark,
  },
});
