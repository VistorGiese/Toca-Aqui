import React from "react";
import { ScrollView, View } from "react-native";
import { ArtistProfileSnapshot } from "@/utils/artistProfile";
import { EstArtistProfileArtistDisplay } from "../types";
import { styles } from "../styles";
import EstArtistProfileBiographySection from "./EstArtistProfileBiographySection";
import EstArtistProfileCoverSection from "./EstArtistProfileCoverSection";
import EstArtistProfileGallerySection from "./EstArtistProfileGallerySection";
import EstArtistProfileGenresSection from "./EstArtistProfileGenresSection";
import EstArtistProfileHeroSection from "./EstArtistProfileHeroSection";
import EstArtistProfileInfoSection from "./EstArtistProfileInfoSection";
import EstArtistProfileInstrumentsSection from "./EstArtistProfileInstrumentsSection";
import EstArtistProfileSocialLinksSection from "./EstArtistProfileSocialLinksSection";
import EstArtistProfileSoundSection from "./EstArtistProfileSoundSection";
import EstArtistProfileStatsSection from "./EstArtistProfileStatsSection";

interface Props {
  profile: ArtistProfileSnapshot;
  display: EstArtistProfileArtistDisplay;
  favoriteCount: number;
  isFavorite: boolean;
  favoriteLoading: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

export default function EstArtistProfileArtistContent({
  profile,
  display,
  favoriteCount,
  isFavorite,
  favoriteLoading,
  onBack,
  onToggleFavorite,
}: Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <EstArtistProfileCoverSection
        coverUrl={display.coverUrl}
        fotoUrl={display.fotoUrl}
        fallbackIcon={display.fallbackIcon}
        showFavorite
        isFavorite={isFavorite}
        favoriteLoading={favoriteLoading}
        onBack={onBack}
        onToggleFavorite={onToggleFavorite}
      />
      <EstArtistProfileHeroSection display={display} />
      <EstArtistProfileStatsSection display={display} favoriteCount={favoriteCount} />
      <EstArtistProfileInstrumentsSection instrumentos={display.instrumentos} />
      <EstArtistProfileBiographySection biografia={profile.biografia ?? ""} />
      <EstArtistProfileGenresSection generos={profile.generos ?? []} />
      <EstArtistProfileSoundSection profile={profile} />
      <EstArtistProfileInfoSection profile={profile} />
      <EstArtistProfileSocialLinksSection links={profile.links_sociais ?? []} />
      <EstArtistProfileGallerySection urls={display.pressKitUrls} />
      <View style={styles.scrollBottomSpacer} />
    </ScrollView>
  );
}
