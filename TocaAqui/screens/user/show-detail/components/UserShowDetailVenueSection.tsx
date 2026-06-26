import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  venue: string;
  address: string;
}

export default function UserShowDetailVenueSection({ venue, address }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>O Local</Text>
      <View style={styles.venueCard}>
        <Text style={styles.venueName}>{venue}</Text>
        {address ? (
          <View style={styles.venueAddress}>
            <FontAwesome5 name="map-marker-alt" size={12} color={DS.textDis} />
            <Text style={styles.venueAddressText}>{address}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
