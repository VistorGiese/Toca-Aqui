import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { ArtistProfileReview } from "../types";
import { styles } from "../styles";

interface Props {
  reviews: ArtistProfileReview[];
}

export default function ArtistProfileReviewsSection({ reviews }: Props) {
  if (reviews.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Avaliações recentes</Text>
      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewAvatar}>
              <FontAwesome5 name="user" size={14} color={DS.accent} />
            </View>
            <View style={styles.reviewMeta}>
              <Text style={styles.reviewAuthor}>
                {review.Usuario?.nome_completo || "Usuário"}
              </Text>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FontAwesome5
                  key={i}
                  name="star"
                  size={11}
                  color={i < review.nota_artista ? DS.gold : DS.textMuted}
                  solid={i < review.nota_artista}
                />
              ))}
            </View>
          </View>
          {review.comentario ? <Text style={styles.reviewText}>{review.comentario}</Text> : null}
        </View>
      ))}
    </View>
  );
}
