import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import {
  formatCardExpiry,
  formatCardNumber,
  formatCvv,
} from "@/utils/inputMasks";
import { DS } from "../constants";
import { CheckoutControl, PayMethod } from "../types";
import { styles } from "../styles";

interface CardValidators {
  cardNumber: (value: string) => true | string;
  cardExpiry: (value: string) => true | string;
  cardCvv: (value: string) => true | string;
}

interface Props {
  control: CheckoutControl;
  payMethod: PayMethod;
  onPayMethodChange: (method: PayMethod) => void;
  cardValidators: CardValidators;
}

export default function UserCheckoutPaymentSection({
  control,
  payMethod,
  onPayMethodChange,
  cardValidators,
}: Props) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Pagamento</Text>

      <View style={styles.payTabs}>
        <TouchableOpacity
          style={[styles.payTab, payMethod === "card" && styles.payTabActive]}
          onPress={() => onPayMethodChange("card")}
        >
          <FontAwesome5
            name="credit-card"
            size={14}
            color={payMethod === "card" ? DS.accent : DS.textDis}
          />
          <Text style={[styles.payTabText, payMethod === "card" && styles.payTabTextActive]}>
            Cartão
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.payTab, payMethod === "pix" && styles.payTabActive]}
          onPress={() => onPayMethodChange("pix")}
        >
          <FontAwesome5
            name="qrcode"
            size={14}
            color={payMethod === "pix" ? DS.accent : DS.textDis}
          />
          <Text style={[styles.payTabText, payMethod === "pix" && styles.payTabTextActive]}>
            Pix
          </Text>
        </TouchableOpacity>
      </View>

      {payMethod === "card" && (
        <>
          <Controller
            control={control}
            name="cardNumber"
            rules={{ validate: cardValidators.cardNumber }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>NÚMERO DO CARTÃO</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#555577"
                  value={value}
                  onChangeText={(text) => onChange(formatCardNumber(text))}
                  keyboardType="numeric"
                />
                <FieldError message={error?.message} />
              </View>
            )}
          />
          <View style={styles.cardRow}>
            <Controller
              control={control}
              name="cardExpiry"
              rules={{ validate: cardValidators.cardExpiry }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>VALIDADE</Text>
                  <TextInput
                    style={[styles.input, error && styles.inputError]}
                    placeholder="MM/AA"
                    placeholderTextColor="#555577"
                    value={value}
                    onChangeText={(text) => onChange(formatCardExpiry(text))}
                    keyboardType="numeric"
                  />
                  <FieldError message={error?.message} />
                </View>
              )}
            />
            <View style={styles.cardFieldSpacer} />
            <Controller
              control={control}
              name="cardCvv"
              rules={{ validate: cardValidators.cardCvv }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={[styles.input, error && styles.inputError]}
                    placeholder="000"
                    placeholderTextColor="#555577"
                    value={value}
                    onChangeText={(text) => onChange(formatCvv(text))}
                    keyboardType="numeric"
                    secureTextEntry
                  />
                  <FieldError message={error?.message} />
                </View>
              )}
            />
          </View>
        </>
      )}

      {payMethod === "pix" && (
        <View style={styles.pixInfo}>
          <FontAwesome5
            name="qrcode"
            size={32}
            color={DS.accent}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.pixText}>
            Após confirmar, um QR Code Pix será gerado para pagamento.
          </Text>
        </View>
      )}
    </View>
  );
}
