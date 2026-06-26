import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import {
  ARTIST_CHIPS,
  ARTIST_DANGER_CHIPS,
  ARTIST_RATING_TITLE,
  DS,
} from "../constants";
import { styles } from "../styles";
import { isDangerChip } from "../utils";
import UserRateShowStarPicker from "./UserRateShowStarPicker";

type Props = {
  rating: number;
  onRatingChange: (value: number) => void;
  ratingError: string;
  onClearError: () => void;
  selectedChips: string[];
  onToggleChip: (chip: string) => void;
};

export default function UserRateShowArtistSection({
  rating,
  onRatingChange,
  ratingError,
  onClearError,
  selectedChips,
  onToggleChip,
}: Props) {
  return (
    <View style={styles.ratingSection}>
      <View style={styles.ratingHeader}>
        <FontAwesome5 name="microphone" size={16} color={DS.accent} />
        <Text style={styles.ratingTitle}>{ARTIST_RATING_TITLE}</Text>
      </View>
      <UserRateShowStarPicker
        value={rating}
        onChange={onRatingChange}
        onClearError={onClearError}
      />
      <FieldError message={ratingError} />

      <View style={styles.chipsRow}>
        {ARTIST_CHIPS.map((chip) => {
          const isSelected = selectedChips.includes(chip);
          const isDanger = isDangerChip(chip, ARTIST_DANGER_CHIPS);
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
