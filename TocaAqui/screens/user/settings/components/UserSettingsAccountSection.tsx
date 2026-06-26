import React from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { styles } from "../styles";
import { EmailErrors } from "../types";

type Props = {
  email: string | undefined;
  onOpenEmailModal: () => void;
  onRedefinirSenha: () => void;
  onConfirmDeleteAccount: () => void;
  emailModal: boolean;
  onCloseEmailModal: () => void;
  novoEmail: string;
  onNovoEmailChange: (value: string) => void;
  senhaEmail: string;
  onSenhaEmailChange: (value: string) => void;
  emailLoading: boolean;
  emailErrors: EmailErrors;
  onClearNovoEmailError: () => void;
  onClearSenhaEmailError: () => void;
  onAlterarEmail: () => void;
  deleteModal: boolean;
  onCloseDeleteModal: () => void;
  senhaDelete: string;
  onSenhaDeleteChange: (value: string) => void;
  deleteLoading: boolean;
  senhaDeleteError: string;
  onClearSenhaDeleteError: () => void;
  onExcluirConta: () => void;
};

export default function UserSettingsAccountSection({
  email,
  onOpenEmailModal,
  onRedefinirSenha,
  onConfirmDeleteAccount,
  emailModal,
  onCloseEmailModal,
  novoEmail,
  onNovoEmailChange,
  senhaEmail,
  onSenhaEmailChange,
  emailLoading,
  emailErrors,
  onClearNovoEmailError,
  onClearSenhaEmailError,
  onAlterarEmail,
  deleteModal,
  onCloseDeleteModal,
  senhaDelete,
  onSenhaDeleteChange,
  deleteLoading,
  senhaDeleteError,
  onClearSenhaDeleteError,
  onExcluirConta,
}: Props) {
  return (
    <>
      <View style={styles.sectionCard}>
        <View style={styles.sectionLabelRow}>
          <FontAwesome5 name="user-circle" size={15} color={DS.accent} />
          <Text style={styles.sectionLabel}>CONTA</Text>
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>E-mail</Text>
            <Text style={styles.settingValue}>{email || "email@exemplo.com"}</Text>
          </View>
          <TouchableOpacity style={styles.smallBtn} onPress={onOpenEmailModal}>
            <Text style={styles.smallBtnText}>Alterar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Senha</Text>
            <Text style={styles.settingValue}>••••••••</Text>
          </View>
          <TouchableOpacity style={styles.smallBtn} onPress={onRedefinirSenha}>
            <Text style={styles.smallBtnText}>Redefinir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.dangerLink} onPress={onConfirmDeleteAccount}>
          <Text style={styles.dangerLinkText}>Excluir conta permanentemente</Text>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={emailModal}
        onBackdropPress={onCloseEmailModal}
        onBackButtonPress={onCloseEmailModal}
        style={styles.modal}
        backdropOpacity={0.7}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Alterar e-mail</Text>
            <TouchableOpacity onPress={onCloseEmailModal}>
              <FontAwesome5 name="times" size={16} color={DS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalLabel}>Novo e-mail</Text>
          <TextInput
            style={[styles.modalInput, emailErrors.novoEmail && styles.modalInputError]}
            placeholder="novo@email.com"
            placeholderTextColor={DS.textDis}
            value={novoEmail}
            onChangeText={(v) => {
              onClearNovoEmailError();
              onNovoEmailChange(v);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FieldError message={emailErrors.novoEmail} />
          <Text style={styles.modalLabel}>Confirme sua senha</Text>
          <TextInput
            style={[styles.modalInput, emailErrors.senhaEmail && styles.modalInputError]}
            placeholder="••••••••"
            placeholderTextColor={DS.textDis}
            value={senhaEmail}
            onChangeText={(v) => {
              onClearSenhaEmailError();
              onSenhaEmailChange(v);
            }}
            secureTextEntry
          />
          <FieldError message={emailErrors.senhaEmail} />
          <TouchableOpacity
            style={[styles.modalBtn, emailLoading && { opacity: 0.7 }]}
            onPress={onAlterarEmail}
            disabled={emailLoading}
          >
            {emailLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.modalBtnText}>SALVAR</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={deleteModal}
        onBackdropPress={onCloseDeleteModal}
        onBackButtonPress={onCloseDeleteModal}
        style={styles.modal}
        backdropOpacity={0.7}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: DS.danger }]}>Excluir conta</Text>
            <TouchableOpacity onPress={onCloseDeleteModal}>
              <FontAwesome5 name="times" size={16} color={DS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalHint}>
            Esta ação não pode ser desfeita. Digite sua senha para confirmar.
          </Text>
          <Text style={styles.modalLabel}>Senha</Text>
          <TextInput
            style={[styles.modalInput, senhaDeleteError && styles.modalInputError]}
            placeholder="••••••••"
            placeholderTextColor={DS.textDis}
            value={senhaDelete}
            onChangeText={(v) => {
              onClearSenhaDeleteError();
              onSenhaDeleteChange(v);
            }}
            secureTextEntry
          />
          <FieldError message={senhaDeleteError} />
          <TouchableOpacity
            style={[styles.modalBtn, styles.modalBtnDanger, deleteLoading && { opacity: 0.7 }]}
            onPress={onExcluirConta}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.modalBtnText}>EXCLUIR PERMANENTEMENTE</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
