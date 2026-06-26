import React from "react";
import { View } from "react-native";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { styles } from "../styles";

interface Props {
  fotoPerfil: string | null;
  uploading: boolean;
  onSelectPhoto: () => void;
}

export default function UserEditProfilePhotoSection({
  fotoPerfil,
  uploading,
  onSelectPhoto,
}: Props) {
  return (
    <View style={styles.photoSection}>
      <ProfileAvatar fotoPerfil={fotoPerfil} uploading={uploading} onPress={onSelectPhoto} />
    </View>
  );
}
