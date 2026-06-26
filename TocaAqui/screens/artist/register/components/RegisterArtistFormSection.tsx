import React from "react";
import { ActivityIndicator, Text, TextInput } from "react-native";
import { Controller, Control, UseFormHandleSubmit } from "react-hook-form";
import { colors } from "@/utils/colors";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { FORM_RULES } from "../constants";
import { styles } from "../styles";
import { RegisterArtistFormData } from "../types";

interface RegisterArtistFormSectionProps {
  control: Control<RegisterArtistFormData>;
  handleSubmit: UseFormHandleSubmit<RegisterArtistFormData>;
  isSubmitting: boolean;
  senha: string;
  emailRef: React.RefObject<TextInput | null>;
  senhaRef: React.RefObject<TextInput | null>;
  confirmarSenhaRef: React.RefObject<TextInput | null>;
  onSubmit: (data: RegisterArtistFormData) => Promise<void>;
}

export default function RegisterArtistFormSection({
  control,
  handleSubmit,
  isSubmitting,
  senha,
  emailRef,
  senhaRef,
  confirmarSenhaRef,
  onSubmit,
}: RegisterArtistFormSectionProps) {
  return (
    <>
      <Controller
        control={control}
        name="nomeCompleto"
        rules={FORM_RULES.nomeCompleto}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error },
        }) => (
          <Input
            inputRef={ref}
            label="Nome completo"
            iconName="account-outline"
            placeholder="Seu nome"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={error?.message}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        rules={FORM_RULES.email}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error },
        }) => (
          <Input
            inputRef={(el) => {
              ref(el);
              emailRef.current = el;
            }}
            label="E-mail"
            iconName="email-outline"
            placeholder="seu@email.com"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={error?.message}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="senha"
        rules={FORM_RULES.senha}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error },
        }) => (
          <Input
            inputRef={(el) => {
              ref(el);
              senhaRef.current = el;
            }}
            label="Senha"
            iconName="lock-outline"
            placeholder="Mínimo 8 caracteres"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={error?.message}
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => confirmarSenhaRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmarSenha"
        rules={{
          required: "Confirme sua senha",
          validate: (value) => value === senha || "As senhas não coincidem",
        }}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error },
        }) => (
          <Input
            inputRef={(el) => {
              ref(el);
              confirmarSenhaRef.current = el;
            }}
            label="Confirmar senha"
            iconName="lock-check-outline"
            placeholder="Repita sua senha"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={error?.message}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />

      <Button
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.purpleDark} />
        ) : (
          <Text style={styles.buttonText}>Criar conta</Text>
        )}
      </Button>
    </>
  );
}
