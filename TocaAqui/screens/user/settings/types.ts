import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";

export type UserSettingsProps = NativeStackScreenProps<UserStackParamList, "UserSettings">;

export type EmailErrors = {
  novoEmail?: string;
  senhaEmail?: string;
};
