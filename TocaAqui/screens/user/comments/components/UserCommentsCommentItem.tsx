import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Comentario } from "@/http/comentarioService";
import { DS } from "../constants";
import { styles } from "../styles";
import { formatTimeAgo } from "../utils";
import UserCommentsCommentAvatar from "./UserCommentsCommentAvatar";

type Props = {
  comentario: Comentario;
  nome: string;
  color: string;
  isOwner: boolean;
  isDeleting: boolean;
  onDelete: () => void;
};

export default function UserCommentsCommentItem({
  comentario,
  nome,
  color,
  isOwner,
  isDeleting,
  onDelete,
}: Props) {
  return (
    <View style={styles.commentCard}>
      <UserCommentsCommentAvatar
        nome={nome}
        fotoPerfil={comentario.Usuario?.foto_perfil}
        color={color}
      />

      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{nome}</Text>
          <View style={styles.commentHeaderRight}>
            <Text style={styles.commentTime}>
              {formatTimeAgo(comentario.createdAt)}
            </Text>
            {isOwner ? (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={onDelete}
                disabled={isDeleting}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={DS.danger} />
                ) : (
                  <FontAwesome5 name="trash-alt" size={12} color={DS.danger} />
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <Text style={styles.commentText}>{comentario.texto}</Text>
      </View>
    </View>
  );
}
