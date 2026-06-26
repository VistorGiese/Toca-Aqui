import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { PUBLISH_BTN_TEXT, SKIP_LINK_TEXT } from "../constants";
import { styles } from "../styles";

type Props = {
  loading: boolean;
  onPublish: () => void;
  onSkip: () => void;
};

export default function UserRateShowActionsSection({
  loading,
  onPublish,
  onSkip,
}: Props) {
  return (
    <>
      <TouchableOpacity
        style={[styles.publishBtn, loading && { opacity: 0.6 }]}
        onPress={onPublish}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.publishBtnText}>{PUBLISH_BTN_TEXT}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipLink} onPress={onSkip}>
        <Text style={styles.skipLinkText}>{SKIP_LINK_TEXT}</Text>
      </TouchableOpacity>
    </>
  );
}
