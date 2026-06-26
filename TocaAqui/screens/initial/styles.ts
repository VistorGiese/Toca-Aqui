import { Dimensions, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";
import { DS } from "./constants";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  fund: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    zIndex: 1,
  },
  shadowImage: {
    position: "absolute",
    bottom: 0,
    width,
    height: "50%",
    zIndex: 2,
  },
  bottomContainer: {
    gap: 8,
  },
  buttonPosition: {
    bottom: "10%",
    width: "55%",
    paddingVertical: "8%",
    alignSelf: "center",
    zIndex: 10,
  },
  registerContainer: {
    flexDirection: "row",
    marginBottom: 85,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  registerText: {
    color: DS.registerText,
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  registerLink: {
    color: DS.registerLink,
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  textButton: {
    fontFamily: "Montserrat-Bold",
    fontSize: 24,
    color: colors.purpleDark,
  },
});
