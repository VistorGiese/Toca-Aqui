import React from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, View } from "react-native";
import { colors } from "@/utils/colors";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  FeedFeaturedCard,
  FeedFilterChips,
  FeedScreenHeader,
  FeedSearchBar,
  FeedShowCard,
} from "@/components/feed";
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

        <View style={styles.sectionSpacingTop}>
          <SectionHeader title="Em Destaque" />
        </View>

        {vm.loadingFeatured ? (
          <View style={styles.featuredLoadingBlock}>
            <ActivityIndicator size="large" color={colors.purpleLight} />
          </View>
        ) : vm.featured ? (
          <FeedFeaturedCard
            show={vm.featured}
            onPress={() => vm.goToDetail(vm.featured!.id)}
          />
        ) : (
          <EmptyState message="Nenhum destaque disponível" />
        )}

        <View style={styles.sectionSubtitleWrapper}>
          <Text style={styles.sectionTitle}>{vm.activeFilter}</Text>
          <Text style={styles.sectionSubtitle}>Eventos acontecendo perto de você</Text>
        </View>

        {vm.loadingShows ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={colors.purpleLight} />
          </View>
        ) : vm.listShows.length === 0 ? (
          <EmptyState message="Nenhum show encontrado" />
        ) : (
          vm.listShows.map((show) => (
            <FeedShowCard
              key={show.id}
              show={show}
              isFavorite={vm.favorites.includes(show.id)}
              onPress={() => vm.goToDetail(show.id)}
              onToggleFavorite={() => vm.toggleFavorite(show.id)}
            />
          ))
        )}

        <View style={styles.listEndSpacing} />
      </ScrollView>
    </View>
  );
}
