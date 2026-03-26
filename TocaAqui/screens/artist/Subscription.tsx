import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  success: "#10B981",
  bgSurface: "#1A1040",
};

interface FeatureItem {
  label: string;
  included: boolean;
}

const FREE_FEATURES: FeatureItem[] = [
  { label: "3 candidaturas por mês", included: true },
  { label: "Perfil básico de artista", included: true },
  { label: "Destaque na busca", included: false },
  { label: "Selo de verificação", included: false },
];

const PRO_FEATURES: FeatureItem[] = [
  { label: "Candidaturas ilimitadas", included: true },
  { label: "Perfil completo com portfólio", included: true },
  { label: "Destaque prioritário no feed", included: true },
  { label: "Selo de Artista Verificado", included: true },
  { label: "Estatísticas de visualização", included: true },
];

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function Subscription() {
  const navigation = useNavigation<NavProp>();

  const handleAssinarPro = () => {
    Alert.alert(
      "Em breve!",
      "A integração com pagamentos está sendo finalizada. Em breve você poderá assinar o plano Pro diretamente pelo app!"
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <FontAwesome5 name="bars" size={18} color={DS.white} />
        </TouchableOpacity>
        <Text style={styles.brandName}>TOCA AQUI</Text>
        <View style={styles.avatarSmall}>
          <FontAwesome5 name="user" size={14} color={DS.accent} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Título */}
        <Text style={styles.title}>
          Eleve sua{"\n"}
          <Text style={styles.titleAccent}>Carreira</Text>
          {"\n"}Musical
        </Text>
        <Text style={styles.subtitle}>
          Escolha o plano ideal para o seu momento e maximize suas oportunidades no Toca Aqui.
        </Text>

        {/* Plano Gratuito */}
        <View style={styles.freePlanCard}>
          <Text style={styles.planTag}>PLANO INICIAL</Text>
          <Text style={styles.freePrice}>Gratuito</Text>
          <View style={styles.separator} />
          {FREE_FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <FontAwesome5
                name={f.included ? "check" : "times"}
                size={13}
                color={f.included ? DS.success : DS.textDis}
              />
              <Text
                style={[
                  styles.featureText,
                  !f.included && styles.featureTextDisabled,
                ]}
              >
                {f.label}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.btnContinueFree} activeOpacity={0.8}>
            <Text style={styles.btnContinueFreeText}>CONTINUAR NO GRATUITO</Text>
          </TouchableOpacity>
        </View>

        {/* Plano Pro */}
        <View style={styles.proPlanCard}>
          <View style={styles.proPlanHeader}>
            <View>
              <Text style={styles.proPlanTag}>ACESSO ILIMITADO</Text>
              <View style={styles.proDot} />
            </View>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>RECOMENDADO</Text>
            </View>
          </View>

          <Text style={styles.proPrice}>
            Pro{" "}
            <Text style={styles.proPriceValue}>R$29</Text>
            <Text style={styles.proPriceMonth}>/mês</Text>
          </Text>

          <View style={styles.separator} />

          {PRO_FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <FontAwesome5 name="check" size={13} color={DS.accent} />
              <Text style={styles.featureTextPro}>{f.label}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.btnAssinarPro}
            onPress={handleAssinarPro}
            activeOpacity={0.85}
          >
            <Text style={styles.btnAssinarProText}>ASSINAR PRO</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Section */}
        <View style={styles.trustRow}>
          <TrustItem icon="lock" label="Pagamento Seguro" />
          <TrustItem icon="undo" label="Cancele quando quiser" />
          <TrustItem icon="headset" label="Suporte Dedicado" />
        </View>
      </ScrollView>
    </View>
  );
}

function TrustItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={trustStyles.item}>
      <View style={trustStyles.iconCircle}>
        <FontAwesome5 name={icon as any} size={16} color={DS.accent} />
      </View>
      <Text style={trustStyles.label}>{label}</Text>
    </View>
  );
}

const trustStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DS.accent + "22",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textSec,
    textAlign: "center",
    lineHeight: 16,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 14,
    color: DS.accent,
    letterSpacing: 2,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS.bgCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: DS.accent,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 26,
    color: DS.white,
    marginBottom: 12,
    lineHeight: 36,
  },
  titleAccent: {
    color: DS.accent,
  },
  subtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
    lineHeight: 22,
    marginBottom: 24,
  },
  freePlanCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  planTag: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.textSec,
    letterSpacing: 2,
    marginBottom: 8,
  },
  freePrice: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: DS.white,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: DS.bgSurface,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.white,
  },
  featureTextDisabled: {
    color: DS.textDis,
    textDecorationLine: "line-through",
  },
  featureTextPro: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.white,
  },
  btnContinueFree: {
    borderWidth: 1.5,
    borderColor: DS.textDis,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  btnContinueFreeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: DS.textSec,
    letterSpacing: 1,
  },
  proPlanCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: DS.accent,
    marginBottom: 24,
  },
  proPlanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  proPlanTag: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: DS.accentLight,
    letterSpacing: 2,
  },
  proDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DS.accent,
    marginTop: 4,
  },
  recommendedBadge: {
    backgroundColor: DS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: DS.white,
    letterSpacing: 1.5,
  },
  proPrice: {
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    color: DS.textSec,
    marginBottom: 16,
  },
  proPriceValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 26,
    color: DS.white,
  },
  proPriceMonth: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
  },
  btnAssinarPro: {
    backgroundColor: DS.accent,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 16,
  },
  btnAssinarProText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 1.5,
  },
  trustRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
});
