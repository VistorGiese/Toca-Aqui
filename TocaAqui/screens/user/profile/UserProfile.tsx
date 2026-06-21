import React from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import FollowedArtistChip from "@/components/profile/FollowedArtistChip";
import FavoriteVenueChip from "@/components/profile/FavoriteVenueChip";
import ProfileActionButton from "@/components/profile/ProfileActionButton";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileScreenHeader from "@/components/profile/ProfileScreenHeader";
import ProfileStatsRow from "@/components/profile/ProfileStatsRow";
import UpcomingShowCard from "@/components/profile/UpcomingShowCard";
import { useUserProfile } from "./useUserProfile";
import { styles } from "./styles";

export default function UserProfile() {
  const vm = useUserProfile();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ProfileScreenHeader onSettingsPress={vm.goToSettings} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          <ProfileAvatar
            fotoPerfil={vm.fotoPerfil}
            uploading={vm.uploadingFoto}
            onPress={vm.handleSelecionarFoto}
          />
          <Text style={styles.displayName}>{vm.displayName}</Text>
          {vm.localizacao && (
            <View style={styles.locationRow}>
              <FontAwesome5 name="map-marker-alt" size={12} color={colors.textTertiary} />
              <Text style={styles.locationText}>{vm.localizacao}</Text>
            </View>
          )}
        </View>

        {vm.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.purpleLight} />
          </View>
        ) : (
          <>
            <ProfileStatsRow stats={vm.stats} />
            <ProfileActionButton onPress={vm.goToSettings} />

            <SectionHeader
              title="Próximos shows"
              actionLabel="VER TODOS"
              onAction={vm.goToAllTickets}
            />
            {vm.proximosShows.length === 0 ? (
              <EmptyState message="Nenhum show próximo" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.upcomingRow}
              >
                {vm.proximosShows.map((ingresso) => {
                  const show = ingresso.Show;
                  if (!show) return null;
                  return (
                    <UpcomingShowCard
                      key={ingresso.id}
                      show={show}
                      onPress={() => vm.goToShowDetail(show.id)}
                    />
                  );
                })}
              </ScrollView>
            )}

            <SectionHeader title="Artistas favoritados" />
            {vm.artistasFavoritados.length === 0 ? (
              <EmptyState message="Nenhum artista favoritado ainda" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.artistsRow}
              >
                {vm.artistasFavoritados.map((artista) => (
                  <FollowedArtistChip
                    key={artista.id}
                    artist={{
                      id: artista.id,
                      nome_artistico: artista.nome_artistico,
                      generos: artista.generos,
                      total_seguidores: 0,
                      seguindo: false,
                    }}
                    onPress={() => vm.goToArtist(artista.id)}
                  />
                ))}
              </ScrollView>
            )}

            <SectionHeader title="Estabelecimentos favoritados" />
            {vm.estabelecimentosFavoritados.length === 0 ? (
              <EmptyState message="Nenhum estabelecimento favoritado ainda" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.artistsRow}
              >
                {vm.estabelecimentosFavoritados.map((local) => (
                  <FavoriteVenueChip
                    key={local.id}
                    venue={local}
                    onPress={() => vm.goToEstablishment(local.id)}
                  />
                ))}
              </ScrollView>
            )}
          </>
        )}

        <View style={styles.listSpacing} />
      </ScrollView>
    </View>
  );
}
