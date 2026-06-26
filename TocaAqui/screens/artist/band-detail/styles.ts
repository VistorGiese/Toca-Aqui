import { Dimensions, StyleSheet } from "react-native";
import { DS } from "./constants";

const { height, width } = Dimensions.get("window");

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
  heroImage: {
    width,
    height: height * 0.35,
    resizeMode: "cover",
  },
  heroPlaceholder: {
    width,
    height: height * 0.35,
    backgroundColor: "rgba(108,92,231,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: height * 0.05,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  homeButton: {
    position: "absolute",
    top: height * 0.05,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(108,92,231,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  bandName: {
    color: DS.white,
    fontSize: 26,
    fontFamily: "AkiraExpanded-Superbold",
    marginBottom: 14,
    lineHeight: 34,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  genrePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  genrePillText: {
    color: DS.white,
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: DS.white,
    fontSize: 14,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionTitleAccent: {
    color: DS.cyan,
  },
  description: {
    color: DS.textSec,
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    lineHeight: 23,
  },
  infoCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.15)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "rgba(108,92,231,0.1)",
    marginVertical: 8,
  },
  infoText: {
    color: DS.textSec,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS.accent,
    borderRadius: 14,
    height: 52,
    gap: 10,
    marginTop: 8,
  },
  editButtonText: {
    color: DS.white,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
});
