import { StyleSheet } from "react-native";
import { colors } from "@/utils/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSpacer: {
    width: 36,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purpleGlowBg,
    borderWidth: 1,
    borderColor: colors.purpleGlowBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 2,
    marginBottom: 6,
  },
  logoSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  formContainer: {
    width: "100%",
    gap: 4,
  },
  termsText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  termsLink: {
    color: colors.purpleLight,
    textDecorationLine: "underline",
  },
  button: {
    width: "100%",
    height: 56,
  },
  buttonText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: colors.white,
    letterSpacing: 1.5,
  },
  loginRow: {
    flexDirection: "row",
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  loginLink: {
    color: colors.purpleLight,
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
});
