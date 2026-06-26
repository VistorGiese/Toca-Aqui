import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { VENUE_TYPES } from "../constants";
import { styles } from "../styles";

type Props = {
  selectedVenues: string[];
  onToggle: (venue: string) => void;
};

export default function UserOnboardingLocationVenuesSection({
  selectedVenues,
  onToggle,
}: Props) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleWhite}>ESCOLHA SEU</Text>
        <Text style={styles.sectionTitleAccent}>CENÁRIO.</Text>
      </View>

      <View style={styles.venueGrid}>
        {VENUE_TYPES.map((venue) => {
          const isSelected = selectedVenues.includes(venue);
          return (
            <TouchableOpacity
              key={venue}
              style={[styles.venueChip, isSelected && styles.venueChipSelected]}
              onPress={() => onToggle(venue)}
              activeOpacity={0.7}
            >
              <Text style={[styles.venueChipText, isSelected && styles.venueChipTextSelected]}>
                {venue}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
