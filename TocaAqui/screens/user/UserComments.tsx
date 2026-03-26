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
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { comentarioService, Comentario } from "@/http/comentarioService";

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

export default function UserComments({ route, navigation }: Props) {
  const { showId, showTitle } = route.params;
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [publishing, setPublishing] = useState(false);

  const MAX_CHARS = 280;

  const loadComentarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await comentarioService.getComentariosByShow(showId);
      setComentarios(data);
      setLikedComments(data.filter((c) => c.eu_curtei).map((c) => c.id));
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os comentários");
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    loadComentarios();
  }, [loadComentarios]);

  async function toggleLike(id: number) {
    try {
      const result = await comentarioService.curtirComentario(id);
      setComentarios((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, curtidas_count: result.curtidas_count } : c
        )
      );
      setLikedComments((prev) =>
        result.curtiu ? [...prev, id] : prev.filter((x) => x !== id)
      );
    } catch {
    }
  }

  async function handlePublish() {
    if (newComment.trim().length === 0) return;
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>COMENTÁRIOS</Text>
        <TouchableOpacity>
          <FontAwesome5 name="cog" size={17} color="#A0A0B8" />
        </TouchableOpacity>
      </View>

      <Text style={styles.showSubtitle} numberOfLines={1}>{showTitle}</Text>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.commentInput}
          placeholder="Compartilhe sua experiência..."
          placeholderTextColor="#555577"
          value={newComment}
          onChangeText={(t) => setNewComment(t.slice(0, MAX_CHARS))}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <View style={styles.inputFooter}>
          <Text style={styles.charCounter}>
            {newComment.length}/{MAX_CHARS}
          </Text>
          <TouchableOpacity
            style={[styles.publishBtn, (newComment.trim().length === 0 || publishing) && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={newComment.trim().length === 0 || publishing}
          >
            <Text style={styles.publishBtnText}>PUBLICAR</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Recentes</Text>
        <FontAwesome5 name="chevron-down" size={11} color="#A78BFA" style={{ marginRight: 8 }} />
        <TouchableOpacity style={styles.sortBtn}>
          <FontAwesome5 name="sort-amount-down" size={13} color="#555577" />
          <Text style={styles.sortBtnText}>ORDENAR</Text>
        </TouchableOpacity>
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
            const liked = likedComments.includes(comentario.id);
            const nome = comentario.Usuario?.nome_completo || "Usuário";
            const initials = getInitials(nome);
            const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
            return (
              <View key={comentario.id} style={styles.commentCard}>
                <View style={[styles.avatar, { backgroundColor: color }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentName}>{nome}</Text>
                    <Text style={styles.commentTime}>{formatTimeAgo(comentario.createdAt)}</Text>
                  </View>

                  <Text style={styles.commentText}>{comentario.texto}</Text>

                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => toggleLike(comentario.id)}
                    >
                      <FontAwesome5
                        name="heart"
                        size={13}
                        color={liked ? "#A78BFA" : "#555577"}
                        solid={liked}
                      />
                      <Text style={[styles.actionCount, liked && { color: "#A78BFA" }]}>
                        {comentario.curtidas_count}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                      <FontAwesome5 name="reply" size={13} color="#555577" />
                      <Text style={styles.actionLabel}>Responder</Text>
                    </TouchableOpacity>
                  </View>
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
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sortLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    marginRight: 4,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sortBtnText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#555577",
    letterSpacing: 0.5,
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
    marginBottom: 10,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#555577",
  },
  actionLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#555577",
  },
});
