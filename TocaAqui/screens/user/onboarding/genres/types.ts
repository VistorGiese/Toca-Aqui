import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";

export type UserOnboardingGenresProps = NativeStackScreenProps<
  RootStackParamList,
  "UserOnboardingGenres"
>;

export type GenreOption = {
  key: string;
  icon: string;
};
