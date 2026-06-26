import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  venueDescription: string;
}

export default function ArtistEventDetailVenueSection({ venueDescription }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Sobre o local</Text>
      <View style={styles.localCard}>
        <Text style={styles.localText}>{venueDescription}</Text>
        <View style={styles.localImagePlaceholder}>
          <FontAwesome5 name="building" size={28} color={DS.textDis} />
        </View>
      </View>
    </>
  );
}
