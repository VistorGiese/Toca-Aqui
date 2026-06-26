import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { getGenreColor } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  instrumentos: string[];
}

export default function UserArtistProfileInstrumentsSection({ instrumentos }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Instrumentos</Text>
      {instrumentos.length === 0 ? (
        <Text style={styles.emptyHint}>Nenhum instrumento informado</Text>
      ) : (
        <View style={styles.chipsWrap}>
          {instrumentos.map((item) => {
            const color = getGenreColor(item.toUpperCase());
            return (
              <View
                key={item}
                style={[styles.instrumentChip, { borderColor: color + "88", backgroundColor: color + "18" }]}
              >
                <FontAwesome5 name="music" size={10} color={color} />
                <Text style={[styles.instrumentChipText, { color }]}>{item}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
