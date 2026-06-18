import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ArtistPublicProfile } from "@/http/establishmentService";
import { RECOMMENDED_DS, recommendedStyles as s } from "./recommendedStyles";

interface RecommendedArtistsSectionProps {
  artists: ArtistPublicProfile[];
  loading?: boolean;
  onPressArtist: (artist: ArtistPublicProfile) => void;
}

export default function RecommendedArtistsSection({
  artists,
  loading = false,
  onPressArtist,
}: RecommendedArtistsSectionProps) {
  return (
    <>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Artistas Recomendados</Text>
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
          {artists.map((artist) => (
            <TouchableOpacity
              key={artist.id}
              style={s.card}
              onPress={() => onPressArtist(artist)}
              activeOpacity={0.8}
            >
              <View style={s.avatar}>
                <FontAwesome5 name="user" size={22} color={RECOMMENDED_DS.accent} />
              </View>
              {artist.generos?.[0] ? (
                <View style={s.genreTag}>
                  <Text style={s.genreTagText}>{artist.generos[0].toUpperCase()}</Text>
                </View>
              ) : null}
              <Text style={s.name} numberOfLines={2}>
                {artist.nome_artistico ?? artist.nome ?? "Artista"}
              </Text>
              <Text style={s.rating}>
                ★ {artist.nota_media != null ? artist.nota_media.toFixed(1) : "—"}
              </Text>
              <View style={s.actionBtn}>
                <Text style={s.actionBtnText}>VER PERFIL</Text>
              </View>
            </TouchableOpacity>
          ))}
          {artists.length === 0 ? (
            <Text style={s.emptyText}>Nenhum artista encontrado.</Text>
          ) : null}
        </ScrollView>
      )}
    </>
  );
}
