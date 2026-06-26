import React from "react";
import { Text, TextInput, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { styles } from "../styles";

type Props = {
  city: string;
  cityError: string;
  onCityChange: (value: string) => void;
};

export default function UserOnboardingLocationCitySection({
  city,
  cityError,
  onCityChange,
}: Props) {
  return (
    <>
      <View style={styles.titleBlock}>
        <Text style={styles.titleWhite}>DEFINA SEU</Text>
        <Text style={styles.titleAccent}>RITMO.</Text>
      </View>

      <Text style={styles.subtitle}>Onde vamos buscar a próxima vibe?</Text>

      <View style={[styles.searchBox, cityError && styles.searchBoxError]}>
        <FontAwesome5
          name="map-marker-alt"
          size={16}
          color={DS.accent}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Busque sua cidade..."
          placeholderTextColor={DS.textDis}
          value={city}
          onChangeText={onCityChange}
        />
      </View>
      <FieldError message={cityError} />
    </>
  );
}
