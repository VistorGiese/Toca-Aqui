import { StyleSheet } from "react-native";

export const RECOMMENDED_DS = {
  card: "#1E1635",
  surface: "#161028",
  border: "#2D2545",
  accent: "#7B61FF",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
};

export const recommendedStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 28,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: RECOMMENDED_DS.textPrimary,
  },
  horizontalList: {
    gap: 12,
    paddingBottom: 8,
  },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: RECOMMENDED_DS.textSecondary,
    paddingLeft: 4,
  },
  card: {
    width: 150,
    backgroundColor: RECOMMENDED_DS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RECOMMENDED_DS.border,
    padding: 12,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: RECOMMENDED_DS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: "rgba(123,97,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  genreTagText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: RECOMMENDED_DS.accent,
    letterSpacing: 1,
  },
  name: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: RECOMMENDED_DS.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: RECOMMENDED_DS.textSecondary,
    textAlign: "center",
    marginBottom: 4,
  },
  rating: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#F39C12",
    marginBottom: 8,
  },
  actionBtn: {
    backgroundColor: RECOMMENDED_DS.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: RECOMMENDED_DS.textPrimary,
    letterSpacing: 1,
  },
});
