import React from "react";
import { View } from "react-native";
import {
  EstSettingsAddMemberModal,
  EstSettingsHeaderSection,
  EstSettingsLoadingState,
  EstSettingsMembersList,
} from "./components";
import { styles } from "./styles";
import { useEstSettings } from "./useEstSettings";

export default function EstSettings() {
  const vm = useEstSettings();

  return (
    <View style={styles.root}>
      <EstSettingsHeaderSection onAdd={vm.openModal} />

      {vm.loading ? (
        <EstSettingsLoadingState />
      ) : (
        <EstSettingsMembersList members={vm.members} onRemove={vm.handleRemove} />
      )}

      <EstSettingsAddMemberModal
        visible={vm.modalVisible}
        email={vm.email}
        emailError={vm.emailError}
        adding={vm.adding}
        onChangeEmail={vm.changeEmail}
        onClose={vm.closeModal}
        onSubmit={vm.handleAdd}
      />
    </View>
  );
}
