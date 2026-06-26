import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  DS,
  VENUE_CHIPS,
  VENUE_DANGER_CHIPS,
  VENUE_RATING_TITLE,
} from "../constants";
import { styles } from "../styles";
import { isDangerChip } from "../utils";
import UserRateShowStarPicker from "./UserRateShowStarPicker";

type Props = {
  rating: number;
  onRatingChange: (value: number) => void;
  selectedChips: string[];
  onToggleChip: (chip: string) => void;
};

export default function UserRateShowVenueSection({
  rating,
  onRatingChange,
  selectedChips,
  onToggleChip,
}: Props) {
  return (
    <View style={styles.ratingSection}>
      <View style={styles.ratingHeader}>
        <FontAwesome5 name="building" size={16} color={DS.accent} />
        <Text style={styles.ratingTitle}>{VENUE_RATING_TITLE}</Text>
      </View>
      <UserRateShowStarPicker value={rating} onChange={onRatingChange} />

      <View style={styles.chipsRow}>
        {VENUE_CHIPS.map((chip) => {
          const isSelected = selectedChips.includes(chip);
          const isDanger = isDangerChip(chip, VENUE_DANGER_CHIPS);
          return (
            <TouchableOpacity
              key={chip}
              style={[
                styles.chip,
                isSelected && (isDanger ? styles.chipDangerSelected : styles.chipSelected),
              ]}
              onPress={() => onToggleChip(chip)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && (isDanger ? styles.chipTextDanger : styles.chipTextSelected),
                ]}
              >
                {chip}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
