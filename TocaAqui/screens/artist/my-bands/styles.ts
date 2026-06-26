import { Dimensions, StyleSheet } from "react-native";
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
  headerBtn: {
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 4,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.15)",
  },
  bandImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  bandImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(108,92,231,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  bandName: {
    color: DS.white,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginBottom: 6,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  genrePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  genrePillText: {
    color: DS.white,
    fontSize: 11,
    fontFamily: "Montserrat-Bold",
  },
  bandDesc: {
    color: DS.textSec,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    lineHeight: 17,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    color: DS.white,
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginTop: 20,
    textAlign: "center",
  },
  emptyText: {
    color: DS.textSec,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.accent,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 28,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    color: DS.white,
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DS.bg,
  },
});
