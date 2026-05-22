import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "@/utils/colors";
import { onboardingStyles as s } from "../styles";
import OnboardingEstProgressBar from "./OnboardingEstProgressBar";
import OnboardingEstHeader from "./OnboardingEstHeader";

interface FooterAction {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface Props {
  step: number;
  stepLabel: string;
  stepName?: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  primaryAction: FooterAction;
  secondaryAction?: FooterAction;
  linkAction?: FooterAction;
  onBack?: () => void;
  onSkip?: () => void;
  showHeaderBrand?: boolean;
  headerRight?: React.ReactNode;
}

export default function OnboardingEstShell({
  step,
  stepLabel,
  stepName,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  linkAction,
  onBack,
  onSkip,
  showHeaderBrand = false,
  headerRight,
}: Props) {
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <OnboardingEstProgressBar currentStep={step} />
      <OnboardingEstHeader onBack={onBack} onSkip={onSkip} showBrand={showHeaderBrand} />

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, s.scrollWithFooter]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.stepMetaRow}>
            <Text style={s.stepLabel}>{stepLabel}</Text>
            {stepName ? <Text style={s.stepName}>{stepName}</Text> : null}
            {headerRight}
          </View>

          {typeof title === "string" ? <Text style={s.title}>{title}</Text> : title}
          {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}

          {children}
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.btnPrimary, (primaryAction.loading || primaryAction.disabled) && s.btnPrimaryDisabled]}
            onPress={primaryAction.onPress}
            disabled={primaryAction.loading || primaryAction.disabled}
            activeOpacity={0.85}
          >
            {primaryAction.loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={s.btnPrimaryText}>{primaryAction.label}</Text>
            )}
          </TouchableOpacity>

          {secondaryAction ? (
            <TouchableOpacity style={s.btnGhost} onPress={secondaryAction.onPress} activeOpacity={0.7}>
              <Text style={s.btnGhostText}>{secondaryAction.label}</Text>
            </TouchableOpacity>
          ) : null}

          {linkAction ? (
            <TouchableOpacity style={s.btnLink} onPress={linkAction.onPress} activeOpacity={0.7}>
              <Text style={s.btnLinkText}>{linkAction.label}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
