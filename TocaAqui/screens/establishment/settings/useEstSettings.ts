import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  establishmentService,
  EstablishmentMember,
  EstablishmentMembersResponse,
} from "@/http/establishmentService";
import { combineMembers, getApiErrorMessage } from "./utils";

export function useEstSettings() {
  const [estabelecimentoId, setEstabelecimentoId] = useState<number | null>(null);
  const [data, setData] = useState<EstablishmentMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("estabelecimentoId").then((id) => {
      if (id) setEstabelecimentoId(Number(id));
    });
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!estabelecimentoId) return;
    try {
      setLoading(true);
      const result = await establishmentService.listMembers(estabelecimentoId);
      setData(result);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os gerenciadores.");
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const members = useMemo(() => combineMembers(data), [data]);

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setEmail("");
    setEmailError("");
    setModalVisible(false);
  }, []);

  const changeEmail = useCallback((value: string) => {
    setEmailError("");
    setEmail(value);
  }, []);

  const handleAdd = useCallback(async () => {
    if (!email.trim()) {
      setEmailError("E-mail é obrigatório");
      return;
    }
    if (!estabelecimentoId) return;

    setEmailError("");
    try {
      setAdding(true);
      await establishmentService.addMember(estabelecimentoId, email.trim());
      setEmail("");
      setModalVisible(false);
      fetchMembers();
    } catch (err: unknown) {
      Alert.alert("Erro", getApiErrorMessage(err, "Não foi possível adicionar o gerenciador."));
    } finally {
      setAdding(false);
    }
  }, [email, estabelecimentoId, fetchMembers]);

  const handleRemove = useCallback(
    (member: EstablishmentMember) => {
      if (!estabelecimentoId) return;

      Alert.alert(
        "Remover gerenciador",
        `Deseja remover ${member.nome_completo} como gerenciador?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Remover",
            style: "destructive",
            onPress: async () => {
              try {
                await establishmentService.removeMember(estabelecimentoId, member.id);
                fetchMembers();
              } catch {
                Alert.alert("Erro", "Não foi possível remover o gerenciador.");
              }
            },
          },
        ]
      );
    },
    [estabelecimentoId, fetchMembers]
  );

  return {
    members,
    loading,
    modalVisible,
    email,
    emailError,
    adding,
    openModal,
    closeModal,
    changeEmail,
    handleAdd,
    handleRemove,
  };
}
