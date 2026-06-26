import React from "react";
import { View, Text, Image } from "react-native";
import { resolveImageUrl } from "@/utils/adapters";
import { CommentAvatarProps } from "../types";
import { styles } from "../styles";
import { getInitials } from "../utils";

export default function UserCommentsCommentAvatar({
  nome,
  fotoPerfil,
  color,
}: CommentAvatarProps) {
  const fotoUrl = resolveImageUrl(fotoPerfil);

  if (fotoUrl) {
    return <Image source={{ uri: fotoUrl }} style={styles.avatarImage} />;
  }

  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{getInitials(nome)}</Text>
    </View>
  );
}
