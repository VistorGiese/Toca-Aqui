import React from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import {
  UserSettingsAccountSection,
  UserSettingsHeader,
  UserSettingsManageProfileSection,
  UserSettingsProfilePreferencesLink,
  UserSettingsSignOut,
} from "./components";
import { APP_VERSION, DS } from "./constants";
import { styles } from "./styles";
import { UserSettingsProps } from "./types";
import { useUserSettings } from "./useUserSettings";

export default function UserSettings(props: UserSettingsProps) {
  const vm = useUserSettings(props);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserSettingsHeader onBack={vm.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Configurações</Text>
        <Text style={styles.pageSubtitle}>
          Gerencie sua experiência e presença na cena musical.
        </Text>

        <UserSettingsAccountSection
          email={vm.user?.email}
          onOpenEmailModal={vm.openEmailModal}
          onRedefinirSenha={vm.handleRedefinirSenha}
          onConfirmDeleteAccount={vm.handleConfirmDeleteAccount}
          emailModal={vm.emailModal}
          onCloseEmailModal={vm.closeEmailModal}
          novoEmail={vm.novoEmail}
          onNovoEmailChange={vm.setNovoEmail}
          senhaEmail={vm.senhaEmail}
          onSenhaEmailChange={vm.setSenhaEmail}
          emailLoading={vm.emailLoading}
          emailErrors={vm.emailErrors}
          onClearNovoEmailError={vm.clearNovoEmailError}
          onClearSenhaEmailError={vm.clearSenhaEmailError}
          onAlterarEmail={vm.handleAlterarEmail}
          deleteModal={vm.deleteModal}
          onCloseDeleteModal={vm.closeDeleteModal}
          senhaDelete={vm.senhaDelete}
          onSenhaDeleteChange={vm.setSenhaDelete}
          deleteLoading={vm.deleteLoading}
          senhaDeleteError={vm.senhaDeleteError}
          onClearSenhaDeleteError={vm.clearSenhaDeleteError}
          onExcluirConta={vm.handleExcluirConta}
        />

        <UserSettingsProfilePreferencesLink onPress={vm.goToEditProfile} />

        <UserSettingsManageProfileSection
          hasArtistProfile={vm.hasArtistProfile}
          hasEstablishment={vm.hasEstablishment}
          onGoToArtistNavigator={vm.goToArtistNavigator}
          onGoToArtistOnboarding={vm.goToArtistOnboarding}
          onGoToEstablishmentNavigator={vm.goToEstablishmentNavigator}
          onGoToVenueRegister={vm.goToVenueRegister}
        />

        <UserSettingsSignOut onPress={vm.handleSignOut} />

        <Text style={styles.footer}>{APP_VERSION}</Text>

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </View>
  );
}
