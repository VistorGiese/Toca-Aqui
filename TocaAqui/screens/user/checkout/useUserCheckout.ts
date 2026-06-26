import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { showService } from "@/http/showService";
import { ingressoService } from "@/http/ingressoService";
import {
  calcCheckoutTotals,
  getTicketBaseUnitPrice,
  getTicketHalfUnitPrice,
} from "@/utils/ticketPricing";
import { validateCpfField, validatePhoneField } from "@/utils/documentValidation";
import {
  MAX_TICKETS_PER_PERSON,
  QTY_ALERT_MESSAGE,
  QTY_ALERT_TITLE,
  SHOW_LOAD_ERROR_MESSAGE,
  SHOW_LOAD_ERROR_TITLE,
  SUBMIT_ERROR_FALLBACK,
  SUBMIT_ERROR_TITLE,
} from "./constants";
import { CheckoutFormData, PayMethod } from "./types";
import {
  buildCardValidators,
  buildCheckoutPayload,
  getApiErrorMessage,
} from "./utils";

type NavProp = NativeStackNavigationProp<UserStackParamList, "UserCheckout">;
type RouteType = RouteProp<UserStackParamList, "UserCheckout">;

export function useUserCheckout() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { showId, showTitle, showDate, venue } = route.params;
  const { user } = useAuth();

  const [qtyFull, setQtyFull] = useState(1);
  const [qtyHalf, setQtyHalf] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [priceFull, setPriceFull] = useState(0);
  const [priceHalf, setPriceHalf] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [loadingShow, setLoadingShow] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const cardValidators = useMemo(
    () => buildCardValidators(isFree, payMethod),
    [isFree, payMethod],
  );

  const { control, handleSubmit } = useForm<CheckoutFormData>({
    mode: "onTouched",
    defaultValues: {
      nome: user?.nome_completo ?? "",
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
        const full = getTicketBaseUnitPrice(show.preco_ingresso_inteira);
        const half = getTicketHalfUnitPrice(
          show.preco_ingresso_inteira,
          show.preco_ingresso_meia,
        );
        setPriceFull(full);
        setPriceHalf(half);
        setIsFree(full === 0);
      } catch {
        Alert.alert(SHOW_LOAD_ERROR_TITLE, SHOW_LOAD_ERROR_MESSAGE);
      } finally {
        setLoadingShow(false);
      }
    }
    fetchShow();
  }, [showId]);

  const { total } = calcCheckoutTotals(qtyFull, priceFull, qtyHalf, priceHalf);
  const totalQty = qtyFull + qtyHalf;
  const isDisabled = totalQty === 0 || submitting;

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const changeQty = useCallback((type: "full" | "half", delta: number) => {
    if (type === "full") {
      setQtyFull((currentFull) => {
        const next = currentFull + delta;
        if (next >= 0 && next + qtyHalf <= MAX_TICKETS_PER_PERSON) {
          return next;
        }
        return currentFull;
      });
    } else {
      setQtyHalf((currentHalf) => {
        const next = currentHalf + delta;
        if (next >= 0 && next + qtyFull <= MAX_TICKETS_PER_PERSON) {
          return next;
        }
        return currentHalf;
      });
    }
  }, [qtyFull, qtyHalf]);

  const onSubmit = useCallback(
    async (data: CheckoutFormData) => {
      if (totalQty === 0) {
        Alert.alert(QTY_ALERT_TITLE, QTY_ALERT_MESSAGE);
        return;
      }

      setSubmitting(true);
      try {
        const payload = buildCheckoutPayload(data, showId);

        for (let i = 0; i < qtyFull; i++) {
          await ingressoService.comprarIngresso({ ...payload, tipo: "inteira" });
        }

        for (let i = 0; i < qtyHalf; i++) {
          await ingressoService.comprarIngresso({ ...payload, tipo: "meia_entrada" });
        }

        navigation.navigate("UserPurchaseConfirmation", {
          showTitle,
          showDate,
          venue,
          price: total,
          buyerName: data.nome || "Comprador",
          payMethod: isFree ? "free" : payMethod,
        });
      } catch (error) {
        Alert.alert(
          SUBMIT_ERROR_TITLE,
          getApiErrorMessage(error, SUBMIT_ERROR_FALLBACK),
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      totalQty,
      showId,
      qtyFull,
      qtyHalf,
      navigation,
      showTitle,
      showDate,
      venue,
      total,
      isFree,
      payMethod,
    ],
  );

  const submit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const nomeRules = {
    required: "Nome completo é obrigatório",
    minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" },
  };

  const cpfRules = {
    validate: (value: string) => validateCpfField(value) ?? true,
  };

  const telefoneRules = {
    validate: (value: string) => validatePhoneField(value, !isFree) ?? true,
  };

  return {
    showTitle,
    showDate,
    venue,
    qtyFull,
    qtyHalf,
    payMethod,
    setPayMethod,
    priceFull,
    priceHalf,
    isFree,
    total,
    loadingShow,
    submitting,
    isDisabled,
    control,
    nomeRules,
    cpfRules,
    telefoneRules,
    cardValidators,
    changeQty,
    submit,
    goBack,
  };
}
