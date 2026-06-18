import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { EstablishmentPublicProfile } from "@/http/establishmentService";
import { parseGenres } from "@/utils/genres";
import { RECOMMENDED_DS, recommendedStyles as s } from "./recommendedStyles";

interface RecommendedEstablishmentsSectionProps {
  establishments: EstablishmentPublicProfile[];
  loading?: boolean;
  onPressEstablishment?: (establishment: EstablishmentPublicProfile) => void;
}

export default function RecommendedEstablishmentsSection({
  establishments,
  loading = false,
  onPressEstablishment,
}: RecommendedEstablishmentsSectionProps) {
  return (
    <>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Estabelecimentos Recomendados</Text>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator size="small" color={RECOMMENDED_DS.accent} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.horizontalList}
        >
          {establishments.map((establishment) => {
            const generos = parseGenres(establishment.generos_musicais);
            const cidade =
              establishment.Address?.cidade ?? establishment.Address?.estado ?? null;
            const content = (
              <>
                <View style={s.avatar}>
                  <FontAwesome5 name="store" size={22} color={RECOMMENDED_DS.accent} />
                </View>
                {generos[0] ? (
                  <View style={s.genreTag}>
                    <Text style={s.genreTagText}>{generos[0]}</Text>
                  </View>
                ) : null}
                <Text style={s.name} numberOfLines={2}>
                  {establishment.nome_estabelecimento ?? "Estabelecimento"}
                </Text>
                {cidade ? (
                  <Text style={s.subtitle} numberOfLines={1}>
                    {cidade}
                  </Text>
                ) : null}
                <Text style={s.rating}>
                  ★{" "}
                  {establishment.nota_media != null
                    ? establishment.nota_media.toFixed(1)
                    : "—"}
                </Text>
                <View style={s.actionBtn}>
                  <Text style={s.actionBtnText}>VER PERFIL</Text>
                </View>
              </>
            );

            if (!onPressEstablishment) {
              return (
                <View key={establishment.id} style={s.card}>
                  {content}
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={establishment.id}
                style={s.card}
                onPress={() => onPressEstablishment(establishment)}
                activeOpacity={0.8}
              >
                {content}
              </TouchableOpacity>
            );
          })}
          {establishments.length === 0 ? (
            <Text style={s.emptyText}>Nenhum estabelecimento encontrado.</Text>
          ) : null}
        </ScrollView>
      )}
    </>
  );
}
