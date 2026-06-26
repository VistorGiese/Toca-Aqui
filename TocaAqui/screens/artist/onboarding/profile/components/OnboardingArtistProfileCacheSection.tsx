import React from "react";
import { View } from "react-native";
import OnboardingArtistProfileFormField from "./OnboardingArtistProfileFormField";
import { styles } from "../styles";

interface Props {
  cacheMin: string;
  cacheMax: string;
  cacheMinError?: string;
  cacheMaxError?: string;
  onChangeCacheMin: (value: string) => void;
  onChangeCacheMax: (value: string) => void;
}

export default function OnboardingArtistProfileCacheSection({
  cacheMin,
  cacheMax,
  cacheMinError,
  cacheMaxError,
  onChangeCacheMin,
  onChangeCacheMax,
}: Props) {
  return (
    <View style={styles.cacheRow}>
      <View style={styles.cacheHalf}>
        <OnboardingArtistProfileFormField
          label="CACHÊ MÍNIMO (R$)"
          labelVariant="field"
          placeholder="0,00"
          keyboardType="numeric"
          value={cacheMin}
          onChangeText={onChangeCacheMin}
          error={cacheMinError}
        />
      </View>
      <View style={styles.cacheHalf}>
        <OnboardingArtistProfileFormField
          label="CACHÊ MÁXIMO (R$)"
          labelVariant="field"
          placeholder="0,00"
          keyboardType="numeric"
          value={cacheMax}
          onChangeText={onChangeCacheMax}
          error={cacheMaxError}
        />
      </View>
    </View>
  );
}
