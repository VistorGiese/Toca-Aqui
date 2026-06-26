import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { styles } from "../styles";

type Props = {
  error: string;
  onNext: () => void;
};

export default function UserOnboardingGenresFooter({ error, onNext }: Props) {
  return (
    <View style={styles.footer}>
      <FieldError message={error} />
      <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.nextBtnText}>PRÓXIMO</Text>
      </TouchableOpacity>
    </View>
  );
}
