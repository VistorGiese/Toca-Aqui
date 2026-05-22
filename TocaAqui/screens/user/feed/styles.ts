import { StyleSheet } from "react-native";
import { colors } from "@/utils/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  sectionSpacingTop: {
    marginTop: 24,
  },
  sectionSubtitleWrapper: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: colors.white,
  },
  sectionSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  loadingBlock: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredLoadingBlock: {
    marginHorizontal: 20,
    borderRadius: 16,
    height: 220,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  listEndSpacing: {
    height: 20,
  },
});
