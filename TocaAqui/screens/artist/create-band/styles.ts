import { Dimensions, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";
import { DS } from "./constants";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  homeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(108,92,231,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
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
  memberSection: {
    width: "100%",
    marginBottom: 20,
  },
  fieldLabel: {
    color: DS.white,
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.2)",
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  dropdownText: {
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(108,92,231,0.2)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.4)",
  },
  memberChipText: {
    color: DS.white,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
  },
});
