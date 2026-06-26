import { useNavigation, useRoute } from "@react-navigation/native";
import { UserPurchaseConfirmationProps } from "./types";

export function useUserPurchaseConfirmation() {
  const { showTitle, showDate, venue, price, buyerName, payMethod } =
    useRoute<UserPurchaseConfirmationProps["route"]>().params;
  const navigation = useNavigation<UserPurchaseConfirmationProps["navigation"]>();

  function goToFeed() {
    navigation.reset({
      index: 0,
      routes: [{ name: "UserTabs" }],
    });
  }

  const isPix = payMethod === "pix";
  const isCard = payMethod === "card";
  const isFree = payMethod === "free";

  return {
    showTitle,
    showDate,
    venue,
    price,
    buyerName,
    payMethod,
    isPix,
    isCard,
    isFree,
    goToFeed,
  };
}
