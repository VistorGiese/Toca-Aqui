import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { getGenreColor } from "@/utils/colors";
import { DS } from "../constants";
import { styles } from "../styles";
import { BandDetailData } from "../types";
import { formatBandCreatedDate } from "../utils";

interface Props {
  band: BandDetailData;
  onEdit: () => void;
}

export default function ArtistBandDetailContent({ band, onEdit }: Props) {
  return (
    <View style={styles.content}>
      <Text style={styles.bandName}>{band.nome_banda}</Text>

      {band.generos_musicais && band.generos_musicais.length > 0 && (
        <View style={styles.genresContainer}>
          {band.generos_musicais.map((genre) => (
            <View
              key={genre}
              style={[styles.genrePill, { backgroundColor: getGenreColor(genre) }]}
            >
              <Text style={styles.genrePillText}>{genre}</Text>
            </View>
          ))}
        </View>
      )}

      {band.descricao && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            SO<Text style={styles.sectionTitleAccent}>BRE</Text>
          </Text>
          <Text style={styles.description}>{band.descricao}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          INFORMA<Text style={styles.sectionTitleAccent}>ÇÕES</Text>
        </Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <FontAwesome5 name="calendar" size={14} color={DS.textSec} />
            <Text style={styles.infoText}>
              Criada em {formatBandCreatedDate(band)}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <FontAwesome5
              name="circle"
              size={10}
              color={band.esta_ativo ? DS.success : DS.danger}
            />
            <Text
              style={[
                styles.infoText,
                { color: band.esta_ativo ? DS.success : DS.danger },
              ]}
            >
              {band.esta_ativo ? "Ativa" : "Inativa"}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.85}>
        <FontAwesome5 name="edit" size={16} color={DS.white} />
        <Text style={styles.editButtonText}>Editar Banda</Text>
      </TouchableOpacity>
    </View>
  );
}
