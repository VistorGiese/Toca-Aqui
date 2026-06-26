import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, PRESS_KIT_MAX } from "../constants";
import { styles } from "../styles";

interface Props {
  pressKit: string[];
  onAddPressKit: () => void;
  onRemovePressKit: (index: number) => void;
}

export default function OnboardingArtistBioPressKitSection({
  pressKit,
  onAddPressKit,
  onRemovePressKit,
}: Props) {
  return (
    <>
      <Text style={[styles.fieldLabel, { marginTop: 20 }]}>PRESS KIT / FOTOS</Text>

      {pressKit.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {pressKit.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.pressKitThumb}>
              <Image source={{ uri }} style={styles.pressKitImage} />
              <TouchableOpacity style={styles.pressKitRemove} onPress={() => onRemovePressKit(index)}>
                <FontAwesome5 name="times" size={10} color={DS.white} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {pressKit.length < PRESS_KIT_MAX && (
        <TouchableOpacity style={styles.uploadArea} activeOpacity={0.8} onPress={onAddPressKit}>
          <FontAwesome5 name="cloud-upload-alt" size={24} color={DS.textSec} />
          <Text style={styles.uploadLabel}>
            {pressKit.length === 0 ? "ADICIONAR FOTOS" : "ADICIONAR MAIS FOTOS"}
          </Text>
          <Text style={styles.uploadSub}>
            PNG, JPG — máx {PRESS_KIT_MAX} fotos ({pressKit.length}/{PRESS_KIT_MAX})
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}
