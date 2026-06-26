import React from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  avatarUrl?: string;
  uploading: boolean;
  onPress: () => void;
}

export default function ArtistEditProfilePhotoSection({ avatarUrl, uploading, onPress }: Props) {
  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity style={styles.avatarBtn} onPress={onPress} disabled={uploading} activeOpacity={0.85}>
        {uploading ? (
          <View style={styles.avatarPlaceholder}>
            <ActivityIndicator color="#7B61FF" />
          </View>
        ) : avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <FontAwesome5 name="user" size={32} color="#7B61FF" />
          </View>
        )}
        <View style={styles.avatarBadge}>
          <FontAwesome5 name="camera" size={10} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
      <Text style={[styles.fieldLabel, { marginTop: 10, textAlign: "center" }]}>
        TOQUE PARA ALTERAR A FOTO
      </Text>
    </View>
  );
}
