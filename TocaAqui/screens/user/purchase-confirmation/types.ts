import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";

export type UserPurchaseConfirmationProps = NativeStackScreenProps<
  UserStackParamList,
  "UserPurchaseConfirmation"
>;

export type EventCardProps = {
  showTitle: string;
  showDate: string;
  venue: string;
  price: number;
  buyerName: string;
};

export type PayMethod = UserStackParamList["UserPurchaseConfirmation"]["payMethod"];
