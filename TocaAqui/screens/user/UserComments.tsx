import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { comentarioService, Comentario } from "@/http/comentarioService";
import { resolveImageUrl } from "@/utils/adapters";
import { useAuth } from "@/contexts/AuthContext";
import FieldError from "@/components/ui/FieldError";

type Props = NativeStackScreenProps<UserStackParamList, "UserComments">;

const AVATAR_COLORS = [
  "#6C5CE7", "#00C896", "#FF6B6B", "#F39C12", "#A78BFA",
  "#00CEC9", "#A67C7C", "#27AE60",
];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} hora${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `Há ${days} dia${days !== 1 ? "s" : ""}`;
}

function getInitials(nome: string): string {
  return nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CommentAvatar({
  nome,
  fotoPerfil,
  color,
}: {
  nome: string;
  fotoPerfil?: string | null;
  color: string;
}) {
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

export default function UserComments({ route, navigation }: Props) {
  const { showId, showTitle } = route.params;
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const MAX_CHARS = 280;

  const loadComentarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await comentarioService.getComentariosByShow(showId);
      setComentarios(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os comentários");
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    loadComentarios();
  }, [loadComentarios]);

  async function handlePublish() {
    if (newComment.trim().length === 0) {
      setCommentError("Comentário é obrigatório");
      return;
    }
    setCommentError("");
    try {
      setPublishing(true);
      const criado = await comentarioService.criarComentario({
        agendamento_id: showId,
        texto: newComment.trim(),
      });
      setComentarios((prev) => [criado, ...prev]);
      setNewComment("");
    } catch {
      Alert.alert("Erro", "Não foi possível enviar seu comentário");
    } finally {
      setPublishing(false);
    }
  }

  function confirmDelete(comentario: Comentario) {
    Alert.alert(
      "Excluir comentário",
      "Tem certeza que deseja excluir este comentário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => handleDelete(comentario.id),
        },
      ]
    );
  }

  async function handleDelete(id: number) {
    try {
      setDeletingId(id);
      await comentarioService.excluirComentario(id);
      setComentarios((prev) => prev.filter((c) => c.id !== id));
    } catch {
      Alert.alert("Erro", "Não foi possível excluir o comentário");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>COMENTÁRIOS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.showSubtitle} numberOfLines={1}>{showTitle}</Text>

      <View style={[styles.inputCard, commentError ? styles.inputCardError : null]}>
        <TextInput
          style={styles.commentInput}
          placeholder="Compartilhe sua experiência..."
          placeholderTextColor="#555577"
          value={newComment}
          onChangeText={(t) => {
            setCommentError("");
            setNewComment(t.slice(0, MAX_CHARS));
          }}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <FieldError message={commentError} />
        <View style={styles.inputFooter}>
          <Text style={styles.charCounter}>
            {newComment.length}/{MAX_CHARS}
          </Text>
          <TouchableOpacity
            style={[styles.publishBtn, publishing && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={publishing}
          >
            <Text style={styles.publishBtnText}>PUBLICAR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#A78BFA" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.commentsList}
        >
          {comentarios.length === 0 && (
            <Text style={styles.emptyText}>Nenhum comentário ainda. Seja o primeiro!</Text>
          )}

          {comentarios.map((comentario, index) => {
            const nome = comentario.Usuario?.nome_completo || "Usuário";
            const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
            const isOwner = user?.id === comentario.usuario_id;
            const isDeleting = deletingId === comentario.id;
            return (
              <View key={comentario.id} style={styles.commentCard}>
                <CommentAvatar
                  nome={nome}
                  fotoPerfil={comentario.Usuario?.foto_perfil}
                  color={color}
                />

                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentName}>{nome}</Text>
                    <View style={styles.commentHeaderRight}>
                      <Text style={styles.commentTime}>{formatTimeAgo(comentario.createdAt)}</Text>
                      {isOwner ? (
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => confirmDelete(comentario)}
                          disabled={isDeleting}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          {isDeleting ? (
                            <ActivityIndicator size="small" color="#FF6B6B" />
                          ) : (
                            <FontAwesome5 name="trash-alt" size={12} color="#FF6B6B" />
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>

                  <Text style={styles.commentText}>{comentario.texto}</Text>
                </View>
              </View>
            );
          })}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  headerSpacer: { width: 24 },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#A78BFA",
    letterSpacing: 2,
  },
  showSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputCard: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
    marginBottom: 16,
  },
  inputCardError: {
    borderColor: "#EF4444",
  },
  commentInput: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#FFFFFF",
    minHeight: 70,
    lineHeight: 22,
  },
  inputFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  charCounter: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#555577",
  },
  publishBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  publishBtnDisabled: { opacity: 0.4 },
  publishBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  commentsList: {
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#555577",
    textAlign: "center",
    marginTop: 40,
  },
  commentCard: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  commentContent: { flex: 1 },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  commentHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deleteBtn: {
    padding: 2,
  },
  commentName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  commentTime: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#555577",
  },
  commentText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
    lineHeight: 20,
  },
});
