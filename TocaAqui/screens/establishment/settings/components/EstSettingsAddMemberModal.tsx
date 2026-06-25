import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FieldError from "@/components/ui/FieldError";
import {
  DS,
  EMAIL_PLACEHOLDER,
  MODAL_SUBTITLE,
  MODAL_TITLE,
} from "../constants";
import { styles } from "../styles";

interface Props {
  visible: boolean;
  email: string;
  emailError: string;
  adding: boolean;
  onChangeEmail: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EstSettingsAddMemberModal({
  visible,
  email,
  emailError,
  adding,
  onChangeEmail,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{MODAL_TITLE}</Text>
          <Text style={styles.modalSub}>{MODAL_SUBTITLE}</Text>

          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder={EMAIL_PLACEHOLDER}
            placeholderTextColor={DS.muted}
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FieldError message={emailError} />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, (!email.trim() || adding) && styles.disabled]}
              onPress={onSubmit}
              disabled={!email.trim() || adding}
            >
              {adding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmText}>Adicionar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
