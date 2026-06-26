import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { comentarioService, Comentario } from "@/http/comentarioService";
import { useAuth } from "@/contexts/AuthContext";
import {
  COMMENT_REQUIRED_ERROR,
  DELETE_ALERT_CANCEL,
  DELETE_ALERT_CONFIRM,
  DELETE_ALERT_MESSAGE,
  DELETE_ALERT_TITLE,
  DELETE_ERROR_MESSAGE,
  DELETE_ERROR_TITLE,
  LOAD_ERROR_MESSAGE,
  LOAD_ERROR_TITLE,
  MAX_CHARS,
  PUBLISH_ERROR_MESSAGE,
  PUBLISH_ERROR_TITLE,
} from "./constants";
import { UserCommentsProps } from "./types";

export function useUserComments() {
  const { showId, showTitle } = useRoute<UserCommentsProps["route"]>().params;
  const navigation = useNavigation<UserCommentsProps["navigation"]>();
  const { user } = useAuth();

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const goBack = () => navigation.goBack();

  const loadComentarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await comentarioService.getComentariosByShow(showId);
      setComentarios(data);
    } catch {
      Alert.alert(LOAD_ERROR_TITLE, LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    loadComentarios();
  }, [loadComentarios]);

  function setCommentText(text: string) {
    setCommentError("");
    setNewComment(text.slice(0, MAX_CHARS));
  }

  async function handlePublish() {
    if (newComment.trim().length === 0) {
      setCommentError(COMMENT_REQUIRED_ERROR);
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
      Alert.alert(PUBLISH_ERROR_TITLE, PUBLISH_ERROR_MESSAGE);
    } finally {
      setPublishing(false);
    }
  }

  function confirmDelete(comentario: Comentario) {
    Alert.alert(DELETE_ALERT_TITLE, DELETE_ALERT_MESSAGE, [
      { text: DELETE_ALERT_CANCEL, style: "cancel" },
      {
        text: DELETE_ALERT_CONFIRM,
        style: "destructive",
        onPress: () => handleDelete(comentario.id),
      },
    ]);
  }

  async function handleDelete(id: number) {
    try {
      setDeletingId(id);
      await comentarioService.excluirComentario(id);
      setComentarios((prev) => prev.filter((c) => c.id !== id));
    } catch {
      Alert.alert(DELETE_ERROR_TITLE, DELETE_ERROR_MESSAGE);
    } finally {
      setDeletingId(null);
    }
  }

  return {
    showTitle,
    user,
    comentarios,
    loading,
    newComment,
    commentError,
    publishing,
    deletingId,
    maxChars: MAX_CHARS,
    goBack,
    setCommentText,
    handlePublish,
    confirmDelete,
  };
}
