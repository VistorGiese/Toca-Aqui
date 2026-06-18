import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import DevelopmentPlaceholder from "@/components/ui/DevelopmentPlaceholder";
import { UserStackParamList } from "@/navigation/UserNavigator";

type Props = NativeStackScreenProps<UserStackParamList, "UserArtistProfile">;

export default function UserArtistProfile({ navigation }: Props) {
  return (
    <DevelopmentPlaceholder
      title="Perfil do Artista"
      onBack={() => navigation.goBack()}
    />
  );
}
