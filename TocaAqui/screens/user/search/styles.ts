import { StyleSheet } from "react-native";
import { DS, SCREEN_TOP_PADDING } from "./constants";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
    paddingTop: SCREEN_TOP_PADDING,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 13,
    color: DS.accent,
    letterSpacing: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgInput,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
  },
  filterBtn: {
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS.textDis,
  },
  tabActive: {
    borderColor: DS.accent,
    backgroundColor: DS.accent + "22",
  },
  tabText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textDis,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: DS.accentLight,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: DS.white,
  },
  listCount: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  imageArea: {
    height: 140,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  genreBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: DS.white,
    letterSpacing: 1,
  },
  body: {
    padding: 14,
  },
  eventName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: DS.white,
    marginBottom: 4,
  },
  artistName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.accent,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: DS.success,
  },
});

export const emptyStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 15,
    color: DS.textSec,
    textAlign: "center",
  },
  subText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textDis,
    textAlign: "center",
  },
});
