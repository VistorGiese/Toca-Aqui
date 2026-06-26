import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  UserCheckoutBuyerSection,
  UserCheckoutHeader,
  UserCheckoutLoadingState,
  UserCheckoutPaymentSection,
  UserCheckoutShowCard,
  UserCheckoutStickyBottom,
  UserCheckoutSummarySection,
  UserCheckoutTicketsSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useUserCheckout } from "./useUserCheckout";

export default function UserCheckout() {
  const vm = useUserCheckout();

  if (vm.loadingShow) {
    return <UserCheckoutLoadingState />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserCheckoutHeader onBack={vm.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <UserCheckoutShowCard
          showTitle={vm.showTitle}
          showDate={vm.showDate}
          venue={vm.venue}
        />

        <UserCheckoutTicketsSection
          isFree={vm.isFree}
          priceFull={vm.priceFull}
          priceHalf={vm.priceHalf}
          qtyFull={vm.qtyFull}
          qtyHalf={vm.qtyHalf}
          onChangeQty={vm.changeQty}
        />

        <UserCheckoutBuyerSection
          control={vm.control}
          nomeRules={vm.nomeRules}
          cpfRules={vm.cpfRules}
          telefoneRules={vm.telefoneRules}
        />

        {!vm.isFree && (
          <UserCheckoutPaymentSection
            control={vm.control}
            payMethod={vm.payMethod}
            onPayMethodChange={vm.setPayMethod}
            cardValidators={vm.cardValidators}
          />
        )}

        <UserCheckoutSummarySection
          isFree={vm.isFree}
          qtyFull={vm.qtyFull}
          qtyHalf={vm.qtyHalf}
          priceFull={vm.priceFull}
          priceHalf={vm.priceHalf}
          total={vm.total}
        />

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>

      <UserCheckoutStickyBottom
        isFree={vm.isFree}
        isDisabled={vm.isDisabled}
        submitting={vm.submitting}
        onSubmit={vm.submit}
      />
    </View>
  );
}
