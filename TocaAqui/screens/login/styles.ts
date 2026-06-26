import { StyleSheet } from "react-native";
import { colors } from "@/utils/colors";

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  bgTexture: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.06,
  },
  glow: {
    position: "absolute",
    top: -120,
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.purplePrimary,
    opacity: 0.18,
  },

  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "center",
  },

  logoWrap: { alignItems: "center", marginBottom: 40 },
  logoImage: { width: 90, height: 90, marginBottom: 14 },
  logoTitle: {
    fontFamily: "AkiraExpanded-SuperBold",
    fontSize: 20,
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 5,
  },
  logoSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: colors.purpleLight,
    letterSpacing: 3,
  },

  headingWrap: { marginBottom: 32 },
  heading: {
    fontFamily: "Montserrat-Bold",
    fontSize: 28,
    color: colors.white,
    marginBottom: 6,
  },
  headingSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.textMuted,
  },

  fieldWrap: { marginBottom: 16 },
  label: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.purpleBlack2,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputIcon: { marginRight: 2 },
  input: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: colors.white,
    padding: 0,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
  },

  forgotWrap: { alignItems: "flex-end", marginBottom: 28, marginTop: 4 },
  forgotText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: colors.purpleLight,
  },

  btn: {
    backgroundColor: colors.purplePrimary,
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: colors.white,
    letterSpacing: 1.5,
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.textMuted,
  },
  registerLink: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: colors.purpleLight,
  },
});
