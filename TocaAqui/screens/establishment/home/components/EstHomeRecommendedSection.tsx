import React from "react";
import {
  RecommendedArtistsSection,
  RecommendedEstablishmentsSection,
} from "@/components/home";
import {
  ArtistPublicProfile,
  EstablishmentPublicProfile,
} from "@/http/establishmentService";

interface Props {
  artists: ArtistPublicProfile[];
  establishments: EstablishmentPublicProfile[];
  loading: boolean;
  onArtistPress: (artist: ArtistPublicProfile) => void;
  onEstablishmentPress: (establishment: EstablishmentPublicProfile) => void;
}

export default function EstHomeRecommendedSection({
  artists,
  establishments,
  loading,
  onArtistPress,
  onEstablishmentPress,
}: Props) {
  return (
    <>
      <RecommendedArtistsSection
        artists={artists}
        loading={loading}
        onPressArtist={onArtistPress}
      />
      <RecommendedEstablishmentsSection
        establishments={establishments}
        loading={loading}
        onPressEstablishment={onEstablishmentPress}
      />
    </>
  );
}
