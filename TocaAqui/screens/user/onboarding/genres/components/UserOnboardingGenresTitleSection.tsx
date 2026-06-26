import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

type Props = {
  selectedCount: number;
};

export default function UserOnboardingGenresTitleSection({ selectedCount }: Props) {
  return (
    <>
      <View style={styles.titleBlock}>
        <Text style={styles.titleWhite}>O que você</Text>
        <Text style={styles.titleAccent}>curte?</Text>
      </View>

      <Text style={styles.subtitle}>
        Vamos personalizar sua experiência baseada nos ritmos que fazem seu coração bater
        mais forte.
      </Text>

      <View style={styles.counterRow}>
        <Text style={styles.counterLabel}>Selecione pelo menos 2</Text>
        <Text style={styles.counterValue}>
          {selectedCount} selecionado{selectedCount !== 1 ? "s" : ""}
        </Text>
      </View>
    </>
  );
}
