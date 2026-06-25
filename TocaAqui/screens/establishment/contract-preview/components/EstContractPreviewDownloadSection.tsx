import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DOWNLOAD_INFO_TEXT, DS } from "../constants";
import { styles } from "../styles";
import EstContractPreviewActionButton from "./EstContractPreviewActionButton";

interface Props {
  busy: boolean;
  onDownload: () => void;
  onGoToShow: () => void;
}

export default function EstContractPreviewDownloadSection({
  busy,
  onDownload,
  onGoToShow,
}: Props) {
  return (
    <>
      <View style={styles.infoCard}>
        <FontAwesome5 name="info-circle" size={16} color={DS.cyan} />
        <Text style={styles.infoText}>{DOWNLOAD_INFO_TEXT}</Text>
      </View>

      <EstContractPreviewActionButton
        variant="primary"
        label="BAIXAR CONTRATO"
        icon="download"
        busy={busy}
        onPress={onDownload}
      />

      <EstContractPreviewActionButton
        variant="secondary"
        label="IR PARA O SHOW"
        busy={false}
        onPress={onGoToShow}
      />
    </>
  );
}
