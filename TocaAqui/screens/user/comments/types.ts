import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";

export type UserCommentsProps = NativeStackScreenProps<
  UserStackParamList,
  "UserComments"
>;

export type CommentAvatarProps = {
  nome: string;
  fotoPerfil?: string | null;
  color: string;
};
