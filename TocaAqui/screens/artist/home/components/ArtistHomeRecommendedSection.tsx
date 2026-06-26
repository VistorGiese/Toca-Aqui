import React from "react";
import { ArtistPublicProfile, EstablishmentPublicProfile } from "@/http/establishmentService";
import {
  RecommendedArtistsSection,
  RecommendedEstablishmentsSection,
} from "@/components/home";

interface Props {
  artists: ArtistPublicProfile[];
  establishments: EstablishmentPublicProfile[];
  loading: boolean;
  onArtistPress: (artist: ArtistPublicProfile) => void;
  onEstablishmentPress: (establishment: EstablishmentPublicProfile) => void;
}

export default function ArtistHomeRecommendedSection({
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
