import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  message: string;
  onBack: () => void;
}

export default function EstArtistProfileErrorState({ message, onBack }: Props) {
  return (
    <View style={[styles.root, styles.errorContainer]}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <FontAwesome5
        name="user-slash"
        size={36}
        color={DS.textSecondary}
        style={styles.errorIcon}
      />
      <Text style={styles.errorTitle}>Perfil indisponível</Text>
      <Text style={[styles.bodyText, styles.errorMessage]}>{message}</Text>
      <TouchableOpacity style={styles.errorBackBtn} onPress={onBack} activeOpacity={0.85}>
        <Text style={styles.errorBackBtnText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
}
