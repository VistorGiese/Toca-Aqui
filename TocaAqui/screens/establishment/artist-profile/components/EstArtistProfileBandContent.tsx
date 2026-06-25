import React from "react";
import { ScrollView, Text, View } from "react-native";
import { BandView, EstArtistProfileHeroDisplay } from "../types";
import { styles } from "../styles";
import EstArtistProfileCoverSection from "./EstArtistProfileCoverSection";
import EstArtistProfileGenresSection from "./EstArtistProfileGenresSection";
import EstArtistProfileHeroSection from "./EstArtistProfileHeroSection";
import EstArtistProfileInfoRow from "./EstArtistProfileInfoRow";

interface Props {
  band: BandView;
  display: EstArtistProfileHeroDisplay;
  onBack: () => void;
}

export default function EstArtistProfileBandContent({ band, display, onBack }: Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <EstArtistProfileCoverSection
        coverUrl={display.coverUrl}
        fotoUrl={display.fotoUrl}
        fallbackIcon={display.fallbackIcon}
        showFavorite={false}
        isFavorite={false}
        favoriteLoading={false}
        onBack={onBack}
        onToggleFavorite={() => {}}
      />
      <EstArtistProfileHeroSection display={display} />

      {band.descricao ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.bodyText}>{band.descricao}</Text>
        </View>
      ) : null}

      <EstArtistProfileGenresSection generos={band.generos} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoCard}>
          {band.esta_ativo != null && (
            <EstArtistProfileInfoRow
              label="Banda ativa"
              value={band.esta_ativo ? "Sim" : "Não"}
            />
          )}
          {band.data_criacao ? (
            <EstArtistProfileInfoRow
              label="Data de criação"
              value={new Date(band.data_criacao).toLocaleDateString("pt-BR")}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.scrollBottomSpacer} />
    </ScrollView>
  );
}
