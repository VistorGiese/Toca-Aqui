import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

interface Props {
  onPress: () => void;
}

export default function ArtistEventDetailApplyButton({ onPress }: Props) {
  return (
    <View style={styles.fixedBottom}>
      <TouchableOpacity style={styles.btnCandidatar} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.btnCandidatarText}>CANDIDATAR-SE PARA A VAGA</Text>
      </TouchableOpacity>
    </View>
  );
}
