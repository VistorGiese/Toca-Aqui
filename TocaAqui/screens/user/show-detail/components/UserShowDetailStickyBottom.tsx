import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Show } from "@/http/showService";
import {
  getShowCtaLabel,
  getShowPriceLabel,
} from "@/screens/user/feed/showHelpers";
import { styles } from "../styles";

interface Props {
  show: Show;
  soldOut: boolean;
  isFree: boolean;
  onCheckout: () => void;
}

export default function UserShowDetailStickyBottom({
  show,
  soldOut,
  isFree,
  onCheckout,
}: Props) {
  return (
    <View style={styles.stickyBottom}>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>A partir de</Text>
        <Text style={styles.priceValue}>
          {getShowPriceLabel(show).toUpperCase()}
        </Text>
      </View>
      <TouchableOpacity
        style={
          soldOut ? styles.disabledBtn : isFree ? styles.confirmBtn : styles.buyBtn
        }
        onPress={onCheckout}
        disabled={soldOut}
        activeOpacity={0.85}
      >
        <Text style={styles.buyBtnText}>
          {soldOut ? "ESGOTADO" : getShowCtaLabel(show)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
