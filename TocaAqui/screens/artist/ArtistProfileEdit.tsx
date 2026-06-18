import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DevelopmentPlaceholder from "@/components/ui/DevelopmentPlaceholder";
import { RootStackParamList } from "../../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ArtistProfileEdit">;

export default function ArtistProfileEdit() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <DevelopmentPlaceholder
      title="Editar Perfil"
      onBack={() => navigation.goBack()}
    />
  );
}
