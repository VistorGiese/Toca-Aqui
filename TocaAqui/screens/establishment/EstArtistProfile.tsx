import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DevelopmentPlaceholder from "@/components/ui/DevelopmentPlaceholder";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstArtistProfile">;

export default function EstArtistProfile() {
  const navigation = useNavigation<NavProp>();

  return (
    <DevelopmentPlaceholder
      title="Perfil do Artista"
      onBack={() => navigation.goBack()}
    />
  );
}
