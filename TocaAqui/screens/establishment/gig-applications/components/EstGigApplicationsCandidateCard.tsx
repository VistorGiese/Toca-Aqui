import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Candidatura } from "@/http/establishmentService";
import { DS, STATUS_LABEL } from "../constants";
import {
  canAcceptNew,
  canReaccept,
  formatPropostaValor,
  getArtistDisplayName,
  isBandaApplication,
} from "../utils";
import { styles } from "../styles";

interface Props {
  candidate: Candidatura;
  eventClosed: boolean;
  openingContract: boolean;
  onViewProfile: (candidate: Candidatura) => void;
  onReview: (candidate: Candidatura) => void;
  onViewContract: (candidate: Candidatura) => void;
}

export default function EstGigApplicationsCandidateCard({
  candidate,
  eventClosed,
  openingContract,
  onViewProfile,
  onReview,
  onViewContract,
}: Props) {
  const artistName = getArtistDisplayName(candidate);
  const isBanda = isBandaApplication(candidate);
  const showAccept = canAcceptNew(candidate, eventClosed);
  const showReaccept = canReaccept(candidate, eventClosed);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <FontAwesome5 name="user" size={20} color={DS.accent} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.name}>{artistName}</Text>
          <View style={styles.badgesRow}>
            {candidate.genero ? (
              <View style={styles.genreBadge}>
                <Text style={styles.genreBadgeText}>{candidate.genero.toUpperCase()}</Text>
              </View>
            ) : null}
            <View
              style={[
                styles.statusBadge,
                candidate.status === "rejeitado" && styles.statusBadgeRejected,
                candidate.status === "aceito" && styles.statusBadgeAccepted,
                candidate.status !== "pendente" &&
                  candidate.status !== "rejeitado" &&
                  candidate.status !== "aceito" &&
                  styles.statusBadgeMuted,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  candidate.status === "rejeitado" && styles.statusBadgeTextRejected,
                  candidate.status === "aceito" && styles.statusBadgeTextAccepted,
                ]}
              >
                {STATUS_LABEL[candidate.status]}
              </Text>
            </View>
          </View>
          <View style={styles.meta}>
            {candidate.nota_media != null ? (
              <Text style={styles.rating}>★ {candidate.nota_media.toFixed(1)}</Text>
            ) : null}
            {candidate.shows_realizados != null ? (
              <Text style={styles.metaText}>· {candidate.shows_realizados} shows</Text>
            ) : null}
          </View>
        </View>
        <FontAwesome5
          name="heart"
          size={16}
          color={candidate.favorited ? DS.accent : DS.border}
        />
      </View>

      {candidate.mensagem ? (
        <Text style={styles.message} numberOfLines={2}>
          {candidate.mensagem}
        </Text>
      ) : null}

      <Text style={styles.valorLine}>
        Proposta: {formatPropostaValor(candidate.valor_proposto)}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => onViewProfile(candidate)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewBtnText}>VER PERFIL</Text>
        </TouchableOpacity>

        {showAccept ? (
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onReview(candidate)}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptBtnText}>{isBanda ? "ACEITAR BANDA" : "ACEITAR"}</Text>
          </TouchableOpacity>
        ) : null}

        {showReaccept ? (
          <TouchableOpacity
            style={styles.reacceptBtn}
            onPress={() => onReview(candidate)}
            activeOpacity={0.8}
          >
            <Text style={styles.reacceptBtnText}>ARTISTA RECUSADO, DESEJA ACEITAR?</Text>
          </TouchableOpacity>
        ) : null}

        {candidate.status === "aceito" ? (
          <TouchableOpacity
            style={styles.contractBtn}
            onPress={() => onViewContract(candidate)}
            disabled={openingContract}
            activeOpacity={0.8}
          >
            {openingContract ? (
              <ActivityIndicator size="small" color={DS.success} />
            ) : (
              <>
                <FontAwesome5 name="file-contract" size={11} color={DS.success} />
                <Text style={styles.contractBtnText}>VER CONTRATO</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
