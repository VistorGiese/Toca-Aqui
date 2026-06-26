import React from "react";
import { Text, View } from "react-native";
import { formatBRL } from "@/utils/ticketPricing";
import { styles } from "../styles";

interface Props {
  isFree: boolean;
  qtyFull: number;
  qtyHalf: number;
  priceFull: number;
  priceHalf: number;
  total: number;
}

export default function UserCheckoutSummarySection({
  isFree,
  qtyFull,
  qtyHalf,
  priceFull,
  priceHalf,
  total,
}: Props) {
  const totalQty = qtyFull + qtyHalf;

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Resumo</Text>
      {isFree ? (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Ingressos ({totalQty}x Gratuito)
          </Text>
          <Text style={styles.summaryValue}>R$ 0,00</Text>
        </View>
      ) : (
        <>
          {qtyFull > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ingressos ({qtyFull}x Inteira)</Text>
              <Text style={styles.summaryValue}>{formatBRL(qtyFull * priceFull)}</Text>
            </View>
          )}
          {qtyHalf > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ingressos ({qtyHalf}x Meia)</Text>
              <Text style={styles.summaryValue}>{formatBRL(qtyHalf * priceHalf)}</Text>
            </View>
          )}
        </>
      )}
      <View style={styles.divider} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatBRL(total)}</Text>
      </View>
    </View>
  );
}
