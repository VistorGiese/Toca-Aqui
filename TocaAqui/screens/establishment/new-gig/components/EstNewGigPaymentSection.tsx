import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { EstNewGigSaleMode } from "../types";
import EstNewGigCurrencyField from "./EstNewGigCurrencyField";
import { styles } from "../styles";

interface Props {
  valorShow: string;
  valorIngresso: string;
  modoVendaIngresso: EstNewGigSaleMode;
  onValorShowChange: (value: string) => void;
  onValorIngressoChange: (value: string) => void;
  onValorShowBlur: () => void;
  onValorIngressoBlur: () => void;
  onModoVendaChange: (mode: EstNewGigSaleMode) => void;
}

export default function EstNewGigPaymentSection({
  valorShow,
  valorIngresso,
  modoVendaIngresso,
  onValorShowChange,
  onValorIngressoChange,
  onValorShowBlur,
  onValorIngressoBlur,
  onModoVendaChange,
}: Props) {
  return (
    <>
      <EstNewGigCurrencyField
        label="CACHÊ DO ARTISTA"
        value={valorShow}
        onChangeText={onValorShowChange}
        onBlurNormalize={onValorShowBlur}
        hint="Remuneração oferecida ao artista contratado. Caso não informado, será registrado como R$ 0,00."
      />

      <Text style={styles.fieldLabel}>FORMA DE VENDA DO INGRESSO</Text>
      <View style={styles.saleModeRow}>
        <TouchableOpacity
          style={[styles.saleModeBtn, modoVendaIngresso === "antecipada" && styles.saleModeBtnActive]}
          onPress={() => onModoVendaChange("antecipada")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.saleModeBtnText,
              modoVendaIngresso === "antecipada" && styles.saleModeBtnTextActive,
            ]}
          >
            Venda antecipada
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saleModeBtn, modoVendaIngresso === "na_porta" && styles.saleModeBtnActive]}
          onPress={() => onModoVendaChange("na_porta")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.saleModeBtnText,
              modoVendaIngresso === "na_porta" && styles.saleModeBtnTextActive,
            ]}
          >
            Venda na porta
          </Text>
        </TouchableOpacity>
      </View>

      <EstNewGigCurrencyField
        label="VALOR DO INGRESSO"
        value={valorIngresso}
        onChangeText={onValorIngressoChange}
        onBlurNormalize={onValorIngressoBlur}
        hint={
          modoVendaIngresso === "na_porta"
            ? "Valor de referência para o público na entrada. Não altera o cachê do artista. Padrão: R$ 0,00."
            : "Preço de venda antecipada pela plataforma, independente do cachê. Padrão: R$ 0,00."
        }
      />
    </>
  );
}
