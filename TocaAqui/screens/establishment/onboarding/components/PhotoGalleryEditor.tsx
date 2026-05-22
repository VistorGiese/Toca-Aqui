import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import { onboardingStyles as s } from "../styles";

interface Props {
  photos: string[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
}

export default function PhotoGalleryEditor({ photos, onAdd, onRemove }: Props) {
  return (
    <>
      <Text style={s.galeriaNote}>
        {photos.length > 0
          ? `${photos.length} foto${photos.length > 1 ? "s" : ""} selecionada${photos.length > 1 ? "s" : ""} (máx. 5)`
          : "Mínimo de 3 fotos para melhor visibilidade dos artistas"}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.galeriaScroll}
        contentContainerStyle={s.galeriaContent}
      >
        {photos.length < 5 && (
          <TouchableOpacity style={s.fotoAdd} onPress={onAdd} activeOpacity={0.75}>
            <MaterialCommunityIcons name="plus" size={22} color={colors.purpleLight} />
            <Text style={s.fotoAddLabel}>ADICIONAR{"\n"}FOTOS</Text>
          </TouchableOpacity>
        )}
        {photos.map((uri) => (
          <View key={uri} style={s.fotoThumb}>
            <Image source={{ uri }} style={s.fotoImage} resizeMode="cover" />
            <TouchableOpacity
              style={s.fotoRemove}
              onPress={() => onRemove(uri)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </>
  );
}
