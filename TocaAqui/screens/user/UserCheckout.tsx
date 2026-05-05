import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { showService } from "@/http/showService";
import { ingressoService } from "@/http/ingressoService";

type Props = NativeStackScreenProps<UserStackParamList, "UserCheckout">;

type FormData = {
  nome: string;
  cpf: string;
  telefone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
};

const SERVICE_FEE_RATE = 0.1;

export default function UserCheckout({ route, navigation }: Props) {
  const { showId, showTitle, showDate, venue } = route.params;

  const [qtyFull, setQtyFull] = useState(1);
  const [qtyHalf, setQtyHalf] = useState(0);
  const [payMethod, setPayMethod] = useState<"card" | "pix">("card");
  const [priceFull, setPriceFull] = useState(0);
  const [priceHalf, setPriceHalf] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [loadingShow, setLoadingShow] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    },
  });

  useEffect(() => {
    async function fetchShow() {
      try {
        const show = await showService.getShowById(showId);
        const full = show.preco_ingresso_inteira ?? 0;
        const half =
          show.preco_ingresso_meia != null
            ? show.preco_ingresso_meia
            : full > 0
            ? full / 2
            : 0;
        setPriceFull(full);
        setPriceHalf(half);
        setIsFree(full === 0);
      } catch {
        Alert.alert("Erro", "Não foi possível carregar os dados do show");
      } finally {
        setLoadingShow(false);
      }
    }
    fetchShow();
  }, [showId]);

  const subtotal = qtyFull * priceFull + qtyHalf * priceHalf;
  const serviceFee = isFree ? 0 : Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = subtotal + serviceFee;

  function changeQty(type: "full" | "half", delta: number) {
    if (type === "full") {
      const next = qtyFull + delta;
      if (next >= 0 && next + qtyHalf <= 4) setQtyFull(next);
    } else {
      const next = qtyHalf + delta;
      if (next >= 0 && next + qtyFull <= 4) setQtyHalf(next);
    }
  }

  async function onSubmit(data: FormData) {
    if (qtyFull + qtyHalf === 0) return;
    setSubmitting(true);
    try {
      const requests: Promise<any>[] = [];

      for (let i = 0; i < qtyFull; i++) {
        requests.push(
          ingressoService.comprarIngresso({
            agendamento_id: showId,
            tipo: "inteira",
            nome_comprador: data.nome,
            cpf: data.cpf,
            telefone: data.telefone,
          })
        );
      }

      for (let i = 0; i < qtyHalf; i++) {
        requests.push(
          ingressoService.comprarIngresso({
            agendamento_id: showId,
            tipo: "meia_entrada",
            nome_comprador: data.nome,
            cpf: data.cpf,
            telefone: data.telefone,
          })
        );
      }

      await Promise.all(requests);

      navigation.navigate("UserPurchaseConfirmation", {
        showTitle,
        showDate,
        venue,
        price: total,
        buyerName: data.nome || "Comprador",
      });
    } catch {
      Alert.alert("Erro", "Não foi possível finalizar a compra");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingShow) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#09090F" />
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  const isDisabled = qtyFull + qtyHalf === 0 || submitting;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <FontAwesome5 name="shopping-cart" size={18} color="#A78BFA" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.showCard}>
          <View style={styles.showCardImage}>
            <FontAwesome5 name="music" size={20} color="rgba(167,139,250,0.5)" />
          </View>
          <View style={styles.showCardInfo}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreBadgeText}>SHOW</Text>
            </View>
            <Text style={styles.showTitle}>{showTitle}</Text>
            <View style={styles.showMeta}>
              <FontAwesome5 name="calendar-alt" size={11} color="#555577" />
              <Text style={styles.showMetaText}>{showDate}</Text>
            </View>
            <View style={styles.showMeta}>
              <FontAwesome5 name="map-marker-alt" size={11} color="#555577" />
              <Text style={styles.showMetaText}>{venue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Selecione os Ingressos</Text>
          <Text style={styles.sectionSubtitle}>Máx. 4 por pessoa</Text>

          <View style={styles.ticketRow}>
            <View>
              <Text style={styles.ticketType}>Inteira</Text>
              <Text style={styles.ticketPrice}>
                {isFree ? "Gratuito" : `R$ ${priceFull.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => changeQty("full", -1)}
                disabled={qtyFull === 0}
              >
                <FontAwesome5
                  name="minus"
                  size={12}
                  color={qtyFull === 0 ? "#333" : "#A78BFA"}
                />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qtyFull}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => changeQty("full", 1)}
                disabled={qtyFull + qtyHalf >= 4}
              >
                <FontAwesome5
                  name="plus"
                  size={12}
                  color={qtyFull + qtyHalf >= 4 ? "#333" : "#A78BFA"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {!isFree && (
            <>
              <View style={styles.divider} />

              <View style={styles.ticketRow}>
                <View>
                  <Text style={styles.ticketType}>Meia-Entrada</Text>
                  <Text style={styles.ticketPrice}>R$ {priceHalf.toFixed(2)}</Text>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => changeQty("half", -1)}
                    disabled={qtyHalf === 0}
                  >
                    <FontAwesome5
                      name="minus"
                      size={12}
                      color={qtyHalf === 0 ? "#333" : "#A78BFA"}
                    />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{qtyHalf}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => changeQty("half", 1)}
                    disabled={qtyFull + qtyHalf >= 4}
                  >
                    <FontAwesome5
                      name="plus"
                      size={12}
                      color={qtyFull + qtyHalf >= 4 ? "#333" : "#A78BFA"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dados do Comprador</Text>

          <Controller
            control={control}
            name="nome"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>NOME COMPLETO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#555577"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="cpf"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>CPF</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#555577"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="telefone"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>TELEFONE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor="#555577"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              </View>
            )}
          />
        </View>

        {!isFree && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pagamento</Text>

            <View style={styles.payTabs}>
              <TouchableOpacity
                style={[styles.payTab, payMethod === "card" && styles.payTabActive]}
                onPress={() => setPayMethod("card")}
              >
                <FontAwesome5
                  name="credit-card"
                  size={14}
                  color={payMethod === "card" ? "#A78BFA" : "#555577"}
                />
                <Text
                  style={[styles.payTabText, payMethod === "card" && styles.payTabTextActive]}
                >
                  Cartão
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.payTab, payMethod === "pix" && styles.payTabActive]}
                onPress={() => setPayMethod("pix")}
              >
                <FontAwesome5
                  name="qrcode"
                  size={14}
                  color={payMethod === "pix" ? "#A78BFA" : "#555577"}
                />
                <Text
                  style={[styles.payTabText, payMethod === "pix" && styles.payTabTextActive]}
                >
                  Pix
                </Text>
              </TouchableOpacity>
            </View>

            {payMethod === "card" && (
              <>
                <Controller
                  control={control}
                  name="cardNumber"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>NÚMERO DO CARTÃO</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor="#555577"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
                <View style={styles.cardRow}>
                  <Controller
                    control={control}
                    name="cardExpiry"
                    render={({ field: { onChange, value } }) => (
                      <View style={[styles.inputWrapper, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>VALIDADE</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/AA"
                          placeholderTextColor="#555577"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                  />
                  <View style={{ width: 12 }} />
                  <Controller
                    control={control}
                    name="cardCvv"
                    render={({ field: { onChange, value } }) => (
                      <View style={[styles.inputWrapper, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>CVV</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="000"
                          placeholderTextColor="#555577"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="numeric"
                          secureTextEntry
                        />
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
                  color="#A78BFA"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.pixText}>
                  Após confirmar, um QR Code Pix será gerado para pagamento.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          {isFree ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Ingressos ({qtyFull + qtyHalf}x Gratuito)
              </Text>
              <Text style={styles.summaryValue}>R$ 0,00</Text>
            </View>
          ) : (
            <>
              {qtyFull > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Ingressos ({qtyFull}x Inteira)
                  </Text>
                  <Text style={styles.summaryValue}>
                    R$ {(qtyFull * priceFull).toFixed(2)}
                  </Text>
                </View>
              )}
              {qtyHalf > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Ingressos ({qtyHalf}x Meia)
                  </Text>
                  <Text style={styles.summaryValue}>
                    R$ {(qtyHalf * priceHalf).toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa de Serviço (10%)</Text>
                <Text style={styles.summaryValue}>R$ {serviceFee.toFixed(2)}</Text>
              </View>
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={[styles.finishBtn, isDisabled && styles.finishBtnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isDisabled}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <FontAwesome5
              name={isFree ? "check" : "lock"}
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.finishBtnText}>
            {isFree ? "CONFIRMAR PRESENÇA" : "FINALIZAR COMPRA"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  centered: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: "#FFFFFF",
  },
  scrollContent: { padding: 20, gap: 16 },
  showCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  showCardImage: {
    width: 80,
    backgroundColor: "#2D1B4E",
    alignItems: "center",
    justifyContent: "center",
  },
  showCardInfo: { flex: 1, padding: 12 },
  genreBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(167,139,250,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 4,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: "#A78BFA",
    letterSpacing: 1,
  },
  showTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  showMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 3,
  },
  showMetaText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A0A0B8",
  },
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#555577",
    marginBottom: 16,
  },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  ticketType: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  ticketPrice: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    minWidth: 20,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 8,
  },
  inputWrapper: { marginBottom: 12 },
  inputLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: "#A78BFA",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#FFFFFF",
  },
  cardRow: { flexDirection: "row" },
  payTabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  payTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  payTabActive: {
    borderColor: "#A78BFA",
    backgroundColor: "rgba(167,139,250,0.1)",
  },
  payTabText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#555577",
  },
  payTabTextActive: { color: "#A78BFA" },
  pixInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },
  pixText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
    textAlign: "center",
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
  },
  summaryValue: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  totalLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  totalValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: "#A78BFA",
  },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0D0D14",
    borderTopWidth: 1,
    borderTopColor: "#1A1040",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },
  finishBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  finishBtnDisabled: { opacity: 0.4 },
  finishBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
});
