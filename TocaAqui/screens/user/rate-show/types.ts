import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";

export type UserRateShowProps = NativeStackScreenProps<
  UserStackParamList,
  "UserRateShow"
>;

export type StarPickerProps = {
  value: number;
  onChange: (v: number) => void;
  onClearError?: () => void;
};
