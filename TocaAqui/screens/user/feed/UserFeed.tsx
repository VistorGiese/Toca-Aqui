import React from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, View } from "react-native";
import { colors } from "@/utils/colors";
import EmptyState from "@/components/ui/EmptyState";
import {
  FeedFilterChips,
  FeedScreenHeader,
  FeedSearchBar,
  FeedShowCard,
} from "@/components/feed";
import {
  RecommendedArtistsSection,
  RecommendedEstablishmentsSection,
} from "@/components/home";
import { FEED_FILTERS } from "./types";
import { useUserFeed } from "./useUserFeed";
import { styles } from "./styles";

export default function UserFeed() {
  const vm = useUserFeed();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FeedScreenHeader onNotificationsPress={vm.goToNotifications} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FeedSearchBar onPress={vm.goToSearch} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FeedFilterChips
            filters={FEED_FILTERS}
            active={vm.activeFilter}
            onChange={vm.setActiveFilter}
          />
        </ScrollView>

        <View style={styles.sectionSubtitleWrapper}>
          <Text style={styles.sectionTitle}>Próximos Shows</Text>
          <Text style={styles.sectionSubtitle}>
            Eventos confirmados com artista
          </Text>
        </View>

        {vm.loadingShows ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={colors.purpleLight} />
          </View>
        ) : vm.shows.length === 0 ? (
          <EmptyState message="Nenhum show confirmado no momento" />
        ) : (
          vm.shows.map((show) => (
            <FeedShowCard
              key={show.id}
              show={show}
              isFavorite={vm.favorites.includes(show.id)}
              onPress={() => vm.goToDetail(show.id)}
              onToggleFavorite={() => vm.toggleFavorite(show.id)}
            />
          ))
        )}

        <View style={styles.recommendedSection}>
          <RecommendedArtistsSection
            artists={vm.recommendedArtists}
            loading={vm.loadingRecommended}
            onPressArtist={vm.goToArtistProfile}
          />

          <RecommendedEstablishmentsSection
            establishments={vm.recommendedEstablishments}
            loading={vm.loadingRecommended}
            onPressEstablishment={vm.goToEstablishmentProfile}
          />
        </View>

        <View style={styles.listEndSpacing} />
      </ScrollView>
    </View>
  );
}
