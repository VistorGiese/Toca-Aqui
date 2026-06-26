import { Dimensions, StyleSheet } from "react-native";
import { DS } from "./constants";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: DS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: height * 0.06,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: DS.bg,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(229,62,62,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: DS.white,
    fontSize: 16,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
  },
  headerTitleAccent: {
    color: DS.cyan,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 4,
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.15)",
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  contractTitle: {
    color: DS.white,
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Montserrat-SemiBold",
  },
  cardDetails: {
    gap: 7,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    color: DS.textSec,
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
  },
  valueText: {
    color: DS.success,
    fontFamily: "Montserrat-Bold",
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
});
