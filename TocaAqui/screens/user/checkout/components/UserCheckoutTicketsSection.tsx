import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { formatBRL } from "@/utils/ticketPricing";
import { MAX_TICKETS_PER_PERSON } from "../constants";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  isFree: boolean;
  priceFull: number;
  priceHalf: number;
  qtyFull: number;
  qtyHalf: number;
  onChangeQty: (type: "full" | "half", delta: number) => void;
}

export default function UserCheckoutTicketsSection({
  isFree,
  priceFull,
  priceHalf,
  qtyFull,
  qtyHalf,
  onChangeQty,
}: Props) {
  const totalQty = qtyFull + qtyHalf;
  const atMax = totalQty >= MAX_TICKETS_PER_PERSON;

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Selecione os Ingressos</Text>
      <Text style={styles.sectionSubtitle}>Máx. {MAX_TICKETS_PER_PERSON} por pessoa</Text>

      <View style={styles.ticketRow}>
        <View>
          <Text style={styles.ticketType}>Inteira</Text>
          <Text style={styles.ticketPrice}>
            {isFree ? "Gratuito" : formatBRL(priceFull)}
          </Text>
        </View>
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onChangeQty("full", -1)}
            disabled={qtyFull === 0}
          >
            <FontAwesome5
              name="minus"
              size={12}
              color={qtyFull === 0 ? "#333" : DS.accent}
            />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qtyFull}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onChangeQty("full", 1)}
            disabled={atMax}
          >
            <FontAwesome5 name="plus" size={12} color={atMax ? "#333" : DS.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {!isFree && (
        <>
          <View style={styles.divider} />

          <View style={styles.ticketRow}>
            <View>
              <Text style={styles.ticketType}>Meia-Entrada</Text>
              <Text style={styles.ticketPrice}>{formatBRL(priceHalf)}</Text>
            </View>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onChangeQty("half", -1)}
                disabled={qtyHalf === 0}
              >
                <FontAwesome5
                  name="minus"
                  size={12}
                  color={qtyHalf === 0 ? "#333" : DS.accent}
                />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qtyHalf}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onChangeQty("half", 1)}
                disabled={atMax}
              >
                <FontAwesome5 name="plus" size={12} color={atMax ? "#333" : DS.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
