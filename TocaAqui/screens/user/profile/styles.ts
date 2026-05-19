import { StyleSheet } from "react-native";
import { colors } from "@/utils/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  displayName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: colors.white,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: colors.textSecondary,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  upcomingRow: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
    marginBottom: 24,
  },
  artistsRow: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 4,
  },
  listSpacing: {
    height: 20,
  },
});
