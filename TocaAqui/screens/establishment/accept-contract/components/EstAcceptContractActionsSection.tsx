import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { AcceptContractDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: AcceptContractDisplay;
  loading: boolean;
  onAccept: () => void;
  onReject: () => void;
  onViewProfile: () => void;
}

export default function EstAcceptContractActionsSection({
  display,
  loading,
  onAccept,
  onReject,
  onViewProfile,
}: Props) {
  return (
    <>
      <TouchableOpacity
        style={[
          display.isReaccept ? styles.btnReaccept : styles.btnAccept,
          (!display.canAccept || loading) && styles.disabled,
        ]}
        onPress={onAccept}
        disabled={!display.canAccept || loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <FontAwesome5 name="check" size={14} color="#fff" />
            <Text style={styles.btnAcceptText}>
              {display.isReaccept ? "SIM, DESEJO ACEITAR" : "ACEITAR E GERAR CONTRATO"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {display.canReject ? (
        <TouchableOpacity
          style={[styles.btnReject, loading && styles.disabled]}
          onPress={onReject}
          disabled={loading}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="times" size={14} color={DS.danger} />
          <Text style={styles.btnRejectText}>RECUSAR CANDIDATURA</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.btnProfile} onPress={onViewProfile} activeOpacity={0.8}>
        <Text style={styles.btnProfileText}>
          Ver perfil completo {display.isBanda ? "da banda" : "do artista"}
        </Text>
        <FontAwesome5 name="chevron-right" size={12} color={DS.accent} />
      </TouchableOpacity>
    </>
  );
}
