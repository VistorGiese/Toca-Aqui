import { StyleSheet } from "react-native";
import { DS } from "./constants";

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: { fontFamily: "Montserrat-Bold", fontSize: 17, color: DS.white },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  emptyText: { fontFamily: "Montserrat-SemiBold", fontSize: 14, color: DS.textDis },
});
