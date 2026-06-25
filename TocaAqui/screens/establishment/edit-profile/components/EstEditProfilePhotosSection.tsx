import React from "react";
import { Text } from "react-native";
import PhotoGalleryEditor from "../../onboarding/components/PhotoGalleryEditor";
import { styles } from "../styles";

interface Props {
  photos: string[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
}

export default function EstEditProfilePhotosSection({ photos, onAdd, onRemove }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Fotos do espaço</Text>
      <PhotoGalleryEditor photos={photos} onAdd={onAdd} onRemove={onRemove} />
    </>
  );
}
