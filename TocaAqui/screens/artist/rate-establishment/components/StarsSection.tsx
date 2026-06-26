import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { DS, RATING_LABELS, STAR_COUNT } from "../constants";
import { styles } from "../styles";

interface Props {
  rating: number;
  ratingError: string;
  onSelect: (value: number) => void;
}

export default function StarsSection({ rating, ratingError, onSelect }: Props) {
  return (
    <>
      <View style={styles.starsRow}>
        {Array.from({ length: STAR_COUNT }).map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(index + 1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome5
              name="star"
              size={40}
              color={index < rating ? DS.gold : DS.textDis}
              solid={index < rating}
            />
          </TouchableOpacity>
        ))}
      </View>
      <FieldError message={ratingError} />
      {rating > 0 ? <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text> : null}
    </>
  );
}
