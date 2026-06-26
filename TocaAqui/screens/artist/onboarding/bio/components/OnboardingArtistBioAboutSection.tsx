import React from "react";
import { Text, TextInput, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { BIO_MAX_LENGTH, DS } from "../constants";
import { styles } from "../styles";

interface Props {
  biografia: string;
  error?: string;
  onChangeBiografia: (value: string) => void;
}

export default function OnboardingArtistBioAboutSection({
  biografia,
  error,
  onChangeBiografia,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Sua vitrine editorial.</Text>
      <Text style={styles.sectionSubtitle}>
        Apresente-se para os estabelecimentos. Seja autêntico e direto.
      </Text>

      <View style={styles.rowBetween}>
        <Text style={styles.fieldLabel}>SOBRE MIM / NÓS</Text>
        <Text style={styles.charCount}>
          {biografia.length} / {BIO_MAX_LENGTH}
        </Text>
      </View>
      <TextInput
        style={[styles.input, styles.textarea, error && styles.inputError]}
        placeholder="Conte sua história, estilo musical, experiências..."
        placeholderTextColor={DS.textDis}
        multiline
        numberOfLines={6}
        maxLength={BIO_MAX_LENGTH}
        value={biografia}
        onChangeText={onChangeBiografia}
        textAlignVertical="top"
      />
      <FieldError message={error} />
    </>
  );
}
