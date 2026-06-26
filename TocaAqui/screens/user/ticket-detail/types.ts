import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";

export type UserTicketDetailProps = NativeStackScreenProps<
  UserStackParamList,
  "UserTicketDetail"
>;
