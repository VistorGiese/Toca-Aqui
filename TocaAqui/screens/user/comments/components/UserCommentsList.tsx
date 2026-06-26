import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Comentario } from "@/http/comentarioService";
import { AVATAR_COLORS, DEFAULT_USER_NAME, DS, EMPTY_TEXT } from "../constants";
import { styles } from "../styles";
import UserCommentsCommentItem from "./UserCommentsCommentItem";

type Props = {
  comentarios: Comentario[];
  currentUserId?: number;
  deletingId: number | null;
  onConfirmDelete: (comentario: Comentario) => void;
};

export default function UserCommentsList({
  comentarios,
  currentUserId,
  deletingId,
  onConfirmDelete,
}: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.commentsList}
    >
      {comentarios.length === 0 && (
        <Text style={styles.emptyText}>{EMPTY_TEXT}</Text>
      )}

      {comentarios.map((comentario, index) => {
        const nome = comentario.Usuario?.nome_completo || DEFAULT_USER_NAME;
        const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
        const isOwner = currentUserId === comentario.usuario_id;
        const isDeleting = deletingId === comentario.id;

        return (
          <UserCommentsCommentItem
            key={comentario.id}
            comentario={comentario}
            nome={nome}
            color={color}
            isOwner={isOwner}
            isDeleting={isDeleting}
            onDelete={() => onConfirmDelete(comentario)}
          />
        );
      })}

      <View style={styles.listBottomSpacer} />
    </ScrollView>
  );
}

export function UserCommentsLoadingState() {
  return <ActivityIndicator color={DS.accent} style={{ marginTop: 40 }} />;
}
