import React from "react";
import { View } from "react-native";
import { VerifyEmailContent } from "./components";
import { styles } from "./styles";
import { useVerifyEmail } from "./useVerifyEmail";

export default function VerifyEmail() {
  const vm = useVerifyEmail();

  return (
    <View style={styles.root}>
      <VerifyEmailContent state={vm.state} onGoToLogin={vm.goToLogin} />
    </View>
  );
}
