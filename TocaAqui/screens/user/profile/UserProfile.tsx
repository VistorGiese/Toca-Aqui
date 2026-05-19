import React from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import FollowedArtistChip from "@/components/profile/FollowedArtistChip";
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

            <SectionHeader title="Artistas seguidos" />
            {vm.artistasSeguidos.length === 0 ? (
              <EmptyState message="Você ainda não segue nenhum artista" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.artistsRow}
              >
                {vm.artistasSeguidos.map((artista) => (
                  <FollowedArtistChip
                    key={artista.id}
                    artist={artista}
                    onPress={() => vm.goToArtist(artista.id)}
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
