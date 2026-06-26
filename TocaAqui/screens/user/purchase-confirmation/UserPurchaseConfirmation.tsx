import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  UserPurchaseConfirmationEventCard,
  UserPurchaseConfirmationPixNotice,
} from "./components";
import {
  BACK_LINK_TEXT,
  CARD_SUBTITLE,
  DS,
  FREE_SUBTITLE,
  SUCCESS_TITLE,
} from "./constants";
import { styles } from "./styles";
import { useUserPurchaseConfirmation } from "./useUserPurchaseConfirmation";

export default function UserPurchaseConfirmation() {
  const vm = useUserPurchaseConfirmation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.successCircle}>
          <FontAwesome5 name="check" size={36} color="#00C896" />
        </View>

        <Text style={styles.successTitle}>{SUCCESS_TITLE}</Text>

        {vm.isCard && (
          <Text style={styles.successSubtitle}>{CARD_SUBTITLE}</Text>
        )}

        {vm.isFree && (
          <Text style={styles.successSubtitle}>{FREE_SUBTITLE}</Text>
        )}

        {vm.isPix && (
          <Text style={styles.successSubtitle}>
            Show de {vm.showTitle} no {vm.venue}
          </Text>
        )}

        <UserPurchaseConfirmationEventCard
          showTitle={vm.showTitle}
          showDate={vm.showDate}
          venue={vm.venue}
          price={vm.price}
          buyerName={vm.buyerName}
        />

        {vm.isPix && <UserPurchaseConfirmationPixNotice />}

        <TouchableOpacity onPress={vm.goToFeed} style={styles.backLink}>
          <Text style={styles.backLinkText}>{BACK_LINK_TEXT}</Text>
        </TouchableOpacity>

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </View>
  );
}
