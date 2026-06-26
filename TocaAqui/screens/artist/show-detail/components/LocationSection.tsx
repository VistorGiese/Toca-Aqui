import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DS } from "../constants";
import { ShowDetailDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: ShowDetailDisplay;
  onOpenMaps: () => void;
}

export default function LocationSection({ display, onOpenMaps }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>LOCALIZAÇÃO</Text>

      <View style={styles.locationCard}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{display.establishmentName}</Text>
          {display.endereco ? (
            <Text style={styles.locationAddr}>{display.endereco}</Text>
          ) : null}
          {display.cidadeEstado ? (
            <Text style={styles.locationAddr}>{display.cidadeEstado}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.mapsBtn} onPress={onOpenMaps}>
          <Text style={styles.mapsBtnText}>OPEN IN MAPS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapVisual}>
        <MaterialCommunityIcons name="map-marker" size={36} color={DS.accent} />
        <Text style={styles.mapVisualText}>Mapa</Text>
      </View>
    </>
  );
}
