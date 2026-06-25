import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function UserEstablishmentProfileErrorState({ onBack }: Props) {
  return (
    <View style={styles.errorContainer}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <Text style={styles.errorText}>Estabelecimento não encontrado.</Text>
      <TouchableOpacity style={styles.errorBackBtn} onPress={onBack} activeOpacity={0.85}>
        <Text style={styles.errorBackBtnText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
}
