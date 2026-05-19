import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/utils/colors";

interface ProfileAvatarProps {
  fotoPerfil: string | null;
  uploading: boolean;
  onPress: () => void;
}

export default function ProfileAvatar({ fotoPerfil, uploading, onPress }: ProfileAvatarProps) {
  return (
    <TouchableOpacity style={styles.avatarWrapper} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarBorder}>
        {fotoPerfil ? (
          <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarInner}>
            <FontAwesome5 name="user" size={36} color={colors.purpleLight} />
          </View>
        )}
      </View>
      <View style={styles.cameraBtn}>
        {uploading ? (
          <ActivityIndicator size={10} color={colors.white} />
        ) : (
          <FontAwesome5 name="camera" size={10} color={colors.white} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 55,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.purpleLight,
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accentSoftFill,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.purplePrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
});
