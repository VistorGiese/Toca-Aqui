import React from "react";
import { Text, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import EstGenreChips from "../../onboarding/components/EstGenreChips";
import { styles } from "../styles";

interface Props {
  selected: string[];
  onToggle: (label: string) => void;
  error?: string;
}

export default function EstEditProfileGenresSection({ selected, onToggle, error }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Gêneros preferidos</Text>
      <View style={error ? styles.generosErrorWrap : undefined}>
        <EstGenreChips selected={selected} onToggle={onToggle} />
      </View>
      <FieldError message={error} />
    </>
  );
}
