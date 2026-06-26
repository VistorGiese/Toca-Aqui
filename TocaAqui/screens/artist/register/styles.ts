import { Dimensions, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";
import { DS, SCROLL_TOP_RATIO } from "./constants";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: height * SCROLL_TOP_RATIO,
    paddingBottom: 40,
    zIndex: 2,
  },
  title: {
    color: DS.white,
    fontSize: 26,
    fontFamily: "AkiraExpanded-Superbold",
    textAlign: "center",
    marginBottom: 10,
  },
  titleAccent: {
    color: DS.cyan,
  },
  subtitle: {
    color: DS.textSec,
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: "95%",
    height: 60,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 22,
    color: colors.purpleDark,
  },
});
