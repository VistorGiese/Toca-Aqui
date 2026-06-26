import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  fotoUri: string | null;
  error?: string;
  onPickPhoto: () => void;
}

export default function OnboardingArtistProfilePhotoSection({
  fotoUri,
  error,
  onPickPhoto,
}: Props) {
  return (
    <View style={styles.photoErrorWrap}>
      <TouchableOpacity
        style={[styles.avatarArea, error ? styles.avatarAreaError : null]}
        activeOpacity={0.7}
        onPress={onPickPhoto}
      >
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
        ) : (
          <>
            <FontAwesome5 name="camera" size={28} color={DS.accent} />
            <Text style={styles.avatarLabel}>ADICIONAR FOTO</Text>
          </>
        )}
      </TouchableOpacity>
      {fotoUri ? (
        <TouchableOpacity style={styles.trocarFotoBtn} onPress={onPickPhoto} activeOpacity={0.7}>
          <Text style={styles.trocarFotoText}>Trocar foto</Text>
        </TouchableOpacity>
      ) : null}
      <FieldError message={error} />
    </View>
  );
}
