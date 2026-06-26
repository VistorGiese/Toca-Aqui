import React from "react";
import { Text, View } from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { Avaliacao } from "@/http/avaliacaoService";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  avaliacoes: Avaliacao[];
}

export default function ArtistEventDetailReviewsSection({ avaliacoes }: Props) {
  if (avaliacoes.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionTitle}>REVIEWS DE ARTISTAS</Text>
      {avaliacoes.map((r) => (
        <View key={r.id} style={styles.reviewCard}>
          <View style={styles.reviewAvatar}>
            <FontAwesome5 name="user" size={14} color={DS.accent} />
          </View>
          <View style={styles.reviewContent}>
            <Text style={styles.reviewName}>{r.Usuario?.nome || "Artista"}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FontAwesome
                  key={i}
                  name={i < r.nota_local ? "star" : "star-o"}
                  size={12}
                  color={i < r.nota_local ? DS.gold : DS.textDis}
                />
              ))}
            </View>
            {r.comentario ? <Text style={styles.reviewText}>{r.comentario}</Text> : null}
          </View>
        </View>
      ))}
    </>
  );
}
