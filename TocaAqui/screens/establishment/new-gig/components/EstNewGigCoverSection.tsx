import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { resolveImageUrl } from "@/utils/adapters";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  capaUri: string | null;
  onSelectCover: () => void;
}

export default function EstNewGigCoverSection({ capaUri, onSelectCover }: Props) {
  return (
    <>
      <Text style={styles.fieldLabel}>CAPA DO EVENTO</Text>
      <TouchableOpacity style={styles.coverPicker} onPress={onSelectCover} activeOpacity={0.85}>
        {capaUri ? (
          <Image
            source={{
              uri: capaUri.startsWith("file:")
                ? capaUri
                : (resolveImageUrl(capaUri) ?? capaUri),
            }}
            style={styles.coverPreview}
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <FontAwesome5 name="image" size={18} color={DS.accent} />
            <Text style={styles.coverPlaceholderText}>Adicionar capa</Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
}
