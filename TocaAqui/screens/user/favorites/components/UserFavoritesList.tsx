import React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import {
  FavoriteArtistItem,
  FavoriteEstablishmentItem,
  FavoriteShowItem,
} from "@/http/favoriteService";
import {
  DS,
  EMPTY_ARTISTS,
  EMPTY_SHOWS,
  EMPTY_VENUES,
} from "../constants";
import { styles } from "../styles";
import { FavoritesTab } from "../types";
import UserFavoritesArtistCard from "./UserFavoritesArtistCard";
import UserFavoritesShowCard from "./UserFavoritesShowCard";
import UserFavoritesVenueCard from "./UserFavoritesVenueCard";

type Props = {
  activeTab: FavoritesTab;
  favShows: FavoriteShowItem[];
  favArtistas: FavoriteArtistItem[];
  favLocais: FavoriteEstablishmentItem[];
  refreshing: boolean;
  onRefresh: () => void;
  onShowPress: (showId: number) => void;
  onShowRemove: (showId: number) => void;
  onArtistPress: (artistId: number) => void;
  onArtistRemove: (artistId: number) => void;
  onVenuePress: (establishmentId: number) => void;
  onVenueRemove: (establishmentId: number) => void;
};

export default function UserFavoritesList({
  activeTab,
  favShows,
  favArtistas,
  favLocais,
  refreshing,
  onRefresh,
  onShowPress,
  onShowRemove,
  onArtistPress,
  onArtistRemove,
  onVenuePress,
  onVenueRemove,
}: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={DS.accent}
          colors={[DS.accent]}
        />
      }
    >
      {activeTab === "SHOWS" && (
        <>
          {favShows.length === 0 && (
            <Text style={styles.emptyText}>{EMPTY_SHOWS}</Text>
          )}
          {favShows.map((item) => (
            <UserFavoritesShowCard
              key={item.show.id}
              item={item}
              onPress={onShowPress}
              onRemove={onShowRemove}
            />
          ))}
        </>
      )}

      {activeTab === "ARTISTAS" && (
        <View style={styles.artistGrid}>
          {favArtistas.length === 0 && (
            <Text style={styles.emptyText}>{EMPTY_ARTISTS}</Text>
          )}
          {favArtistas.map((artista) => (
            <UserFavoritesArtistCard
              key={artista.id}
              artista={artista}
              onPress={onArtistPress}
              onRemove={onArtistRemove}
            />
          ))}
        </View>
      )}

      {activeTab === "LOCAIS" && (
        <>
          {favLocais.length === 0 && (
            <Text style={styles.emptyText}>{EMPTY_VENUES}</Text>
          )}
          {favLocais.map((local) => (
            <UserFavoritesVenueCard
              key={local.id}
              local={local}
              onPress={onVenuePress}
              onRemove={onVenueRemove}
            />
          ))}
        </>
      )}

      <View style={styles.scrollBottomSpacer} />
    </ScrollView>
  );
}
