import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import {
  buildAcceptContractDisplay,
  extractContractFromResponse,
  getApiErrorMessage,
} from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstAcceptContract">;
type RouteType = RouteProp<EstStackParamList, "EstAcceptContract">;

export function useEstAcceptContract() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const {
    applicationId,
    gigId,
    status,
    artistaId,
    bandaId,
    artistName,
    gigTitle,
    valorProposto,
    mensagem,
    eventClosed,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const display = useMemo(
    () =>
      buildAcceptContractDisplay({
        applicationId,
        gigTitle,
        artistName,
        valorProposto,
        mensagem,
        status,
        artistaId,
        bandaId,
        eventClosed,
      }),
    [
      applicationId,
      gigTitle,
      artistName,
      valorProposto,
      mensagem,
      status,
      artistaId,
      bandaId,
      eventClosed,
    ]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openProfile = useCallback(() => {
    if (artistaId) {
      navigation.navigate("EstArtistProfile", {
        artistId: artistaId,
        profile: { id: artistaId, nome_artistico: artistName },
      });
      return;
    }
    if (bandaId) {
      navigation.navigate("EstArtistProfile", { bandaId });
      return;
    }
    Alert.alert("Erro", "Perfil indisponível para esta candidatura.");
  }, [navigation, artistaId, bandaId, artistName]);

  const navigateToContractPreview = useCallback(
    (contractId: number, contrato: Record<string, unknown> | null) => {
      navigation.navigate("EstContractPreview", {
        contractId,
        artistName,
        gigTitle,
        eventoId: gigId,
        initialContract: contrato ?? undefined,
      });
    },
    [navigation, artistName, gigTitle, gigId]
  );

  const handleAccept = useCallback(() => {
    if (!display.canAccept) {
      Alert.alert(
        "Indisponível",
        display.eventClosed
          ? "Este evento já possui candidatura aceita."
          : "Esta candidatura não pode mais ser aceita."
      );
      return;
    }

    Alert.alert(
      display.isReaccept ? "Aceitar artista recusado" : "Aceitar candidatura",
      display.isReaccept
        ? `${artistName} foi recusado(a) anteriormente. Deseja aceitar e contratar para "${gigTitle}"?`
        : `Confirmar a contratação de ${artistName} para "${gigTitle}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await establishmentService.acceptApplication(applicationId);
              let { contrato, contractId } = extractContractFromResponse(response);

              if (!contractId) {
                const byEvent = await establishmentService.getContractByEventId(gigId);
                contrato = byEvent;
                contractId = byEvent?.id != null ? Number(byEvent.id) : null;
              }

              try {
                await establishmentService.updateGig(gigId, { esta_publico: false });
              } catch {
              }

              if (!contractId) {
                Alert.alert(
                  "Candidatura aceita, mas contrato não foi gerado",
                  "O artista foi contratado, porém houve uma falha ao registrar o contrato no servidor (provavelmente banco desatualizado). Atualize o backend com as migrations e tente novamente em um novo evento, ou contate o suporte.",
                  [{ text: "OK", onPress: goBack }]
                );
                return;
              }

              Alert.alert(
                "Candidatura aceita!",
                `${artistName} foi contratado(a). Revise o contrato gerado e baixe o PDF para assinar.`,
                [
                  {
                    text: "OK",
                    onPress: () => navigateToContractPreview(contractId, contrato),
                  },
                ]
              );
            } catch (err: unknown) {
              Alert.alert(
                "Erro",
                getApiErrorMessage(err, "Erro ao aceitar candidatura.")
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [
    display.canAccept,
    display.eventClosed,
    display.isReaccept,
    applicationId,
    artistName,
    gigTitle,
    gigId,
    goBack,
    navigateToContractPreview,
  ]);

  const handleReject = useCallback(() => {
    if (!display.canReject) {
      Alert.alert(
        "Indisponível",
        display.eventClosed
          ? "Este evento já possui candidatura aceita."
          : "Esta candidatura não pode mais ser recusada."
      );
      return;
    }

    Alert.alert(
      "Recusar candidatura",
      `Deseja recusar a candidatura de ${artistName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recusar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await establishmentService.rejectApplication(applicationId);
              Alert.alert("Candidatura recusada", "O artista será notificado.", [
                { text: "OK", onPress: goBack },
              ]);
            } catch (err: unknown) {
              Alert.alert(
                "Erro",
                getApiErrorMessage(err, "Erro ao recusar candidatura.")
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [display.canReject, display.eventClosed, applicationId, artistName, goBack]);

  return {
    display,
    loading,
    goBack,
    openProfile,
    handleAccept,
    handleReject,
  };
}
