import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  UserShowDetailAboutSection,
  UserShowDetailArtistSection,
  UserShowDetailAttendeesSection,
  UserShowDetailCommentsLink,
  UserShowDetailCoverSection,
  UserShowDetailInfoGrid,
  UserShowDetailLoadingState,
  UserShowDetailRatingSection,
  UserShowDetailStickyBottom,
  UserShowDetailVenueSection,
} from "./components";
import { styles } from "./styles";
import { useUserShowDetail } from "./useUserShowDetail";
import { formatShowDate, formatTime } from "./utils";

export default function UserShowDetail() {
  const vm = useUserShowDetail();

  if (vm.loading || !vm.show) {
    return <UserShowDetailLoadingState />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <UserShowDetailCoverSection
        coverUrl={vm.coverUrl ?? null}
        imageColor={vm.imageColor!}
        genreColor={vm.genreColor!}
        genre={vm.show.genero_musical ?? ""}
        title={vm.show.titulo_evento}
        onBack={vm.goBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <UserShowDetailInfoGrid
          date={formatShowDate(vm.show.data_show)}
          time={formatTime(vm.show.horario_inicio)}
        />

        <UserShowDetailAboutSection description={vm.show.descricao_evento ?? ""} />

        {vm.rating != null && vm.avaliacoes && (
          <UserShowDetailRatingSection
            rating={vm.rating}
            total={vm.avaliacoes.total}
          />
        )}

        <UserShowDetailAttendeesSection attendees={vm.attendees!} />

        <UserShowDetailArtistSection
          artistId={vm.artistId ?? null}
          artistName={vm.artistName ?? null}
          confirmedBand={vm.confirmedBand ?? null}
          onPressArtist={vm.goToArtist}
        />

        <UserShowDetailVenueSection
          venue={vm.venue!}
          address={vm.address!}
        />

        <UserShowDetailCommentsLink onPress={vm.goToComments} />

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>

      <UserShowDetailStickyBottom
        show={vm.show}
        soldOut={vm.soldOut!}
        isFree={vm.isFree!}
        onCheckout={vm.goToCheckout}
      />
    </View>
  );
}
