import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { ShowDetailDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: ShowDetailDisplay;
  completing: boolean;
  cancelling: boolean;
  onRate: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export default function EstShowDetailActionsSection({
  display,
  completing,
  cancelling,
  onRate,
  onComplete,
  onCancel,
}: Props) {
  return (
    <>
      {display.canRate ? (
        <TouchableOpacity style={styles.btnRate} onPress={onRate} activeOpacity={0.85}>
          <FontAwesome5 name="star" size={14} color="#fff" />
          <Text style={styles.btnRateText}>AVALIAR ARTISTA</Text>
        </TouchableOpacity>
      ) : null}

      {display.canComplete ? (
        <TouchableOpacity
          style={[styles.btnComplete, completing && styles.disabled]}
          onPress={onComplete}
          disabled={completing}
          activeOpacity={0.85}
        >
          {completing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <FontAwesome5 name="check-circle" size={14} color="#fff" />
              <Text style={styles.btnCompleteText}>MARCAR COMO REALIZADO</Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}

      {display.showCancelAction ? (
        <TouchableOpacity
          style={[styles.btnCancel, cancelling && styles.disabled]}
          onPress={onCancel}
          disabled={cancelling}
          activeOpacity={0.8}
        >
          {cancelling ? (
            <ActivityIndicator color={DS.danger} size="small" />
          ) : (
            <Text style={styles.btnCancelText}>CANCELAR SHOW</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </>
  );
}
