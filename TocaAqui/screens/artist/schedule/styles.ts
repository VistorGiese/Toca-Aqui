import { StyleSheet } from "react-native";
import { DS } from "./constants";

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
    gap: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: DS.textPrimary,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DS.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  browseBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: DS.textPrimary,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS.border,
    backgroundColor: DS.surface,
  },
  filterChipActive: {
    backgroundColor: DS.accent + "22",
    borderColor: DS.accent,
  },
  filterChipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textSecondary,
  },
  filterChipTextActive: {
    color: DS.accent,
  },
  calendarSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: DS.textPrimary,
  },
  monthBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DS.card,
    borderWidth: 1,
    borderColor: DS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekdayText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.textMuted,
  },
  daysGrid: {
    gap: 2,
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  dayInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInnerSelected: {
    backgroundColor: DS.accent,
  },
  dayInnerToday: {
    borderWidth: 1,
    borderColor: DS.accent,
  },
  dayText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.textPrimary,
  },
  dayTextMuted: {
    color: DS.textMuted,
  },
  dayTextSelected: {
    color: DS.textPrimary,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: DS.cyan,
    marginTop: 2,
  },
  clearDayBtn: {
    alignSelf: "center",
    marginTop: 8,
    paddingVertical: 4,
  },
  clearDayText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.accent,
  },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100, gap: 20 },
  groupTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.textSecondary,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    gap: 12,
    marginBottom: 10,
  },
  timeBlock: { width: 52, alignItems: "center" },
  timeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.accent,
  },
  itemBody: { flex: 1, gap: 4 },
  itemTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: DS.textPrimary,
  },
  itemSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textSecondary,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  statusText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    letterSpacing: 0.3,
  },
  loading: { marginTop: 40 },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSecondary,
    textAlign: "center",
  },
});
