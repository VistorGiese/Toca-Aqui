import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { colors } from "@/utils/colors";
import { useAuth } from "@/contexts/AuthContext";
import Input from "../../components/Allcomponents/Input";
import Button from "../../components/Allcomponents/Button";
import NavBar from "@/components/Allcomponents/NavBar";
import api from "@/http/api";
import { showApiError } from "@/utils/errorHandler";

const { height } = Dimensions.get("window");

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  accent: "#6C5CE7",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileFormData {
  nome: string;
  email: string;
}

export default function ArtistProfileEdit() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue } = useForm<ProfileFormData>({
    mode: "onTouched",
    defaultValues: {
      nome: user?.nome_completo || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("nome", user.nome_completo);
      setValue("email", user.email);
    }
  }, [user]);

  async function onSubmit(data: ProfileFormData) {
    setIsSubmitting(true);
    try {
      // Atualiza nome do usuário
      await api.put("/usuarios/nome", { nome_completo: data.nome });
      await updateUser();
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      showApiError(error, "Erro ao atualizar perfil.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>
          MEU <Text style={styles.headerTitleAccent}>PERFIL</Text>
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={16} color={DS.danger} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <FontAwesome5 name="user" size={36} color={DS.accent} />
              </View>
            </View>
            <Text style={styles.userName}>{user?.nome_completo}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>ARTISTA</Text>
            </View>
          </View>

          {/* Form */}
          <Controller
            control={control}
            name="nome"
            rules={{ required: "Nome é obrigatório" }}
            render={({
              field: { onChange, onBlur, value, ref },
              fieldState: { error },
            }) => (
              <Input
                inputRef={ref}
                label="Nome"
                iconName="account-outline"
                placeholder="Seu nome"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={error?.message}
                app
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value } }) => (
              <Input
                label="E-mail"
                iconName="email-outline"
                placeholder="E-mail"
                value={value}
                editable={false}
                app
              />
            )}
          />

          <Button
            style={styles.saveButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.purpleDark} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </Button>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionLabel}>
              MENU
            </Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("MyBands")}
            >
              <View style={styles.menuIconWrap}>
                <FontAwesome5 name="music" size={16} color={DS.accent} />
              </View>
              <Text style={styles.menuItemText}>Minhas Bandas</Text>
              <FontAwesome5 name="chevron-right" size={13} color={DS.textDis} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("MyContracts")}
            >
              <View style={styles.menuIconWrap}>
                <FontAwesome5 name="file-contract" size={16} color={DS.accent} />
              </View>
              <Text style={styles.menuItemText}>Meus Contratos</Text>
              <FontAwesome5 name="chevron-right" size={13} color={DS.textDis} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (navigation as any).navigate("UserNotifications")}
            >
              <View style={styles.menuIconWrap}>
                <FontAwesome5 name="bell" size={16} color={DS.accent} />
              </View>
              <Text style={styles.menuItemText}>Notificações</Text>
              <FontAwesome5 name="chevron-right" size={13} color={DS.textDis} />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={17} color={DS.danger} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>

          <View style={{ height: 130 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: height * 0.06,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: DS.bg,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(229,62,62,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: DS.white,
    fontSize: 16,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
  },
  headerTitleAccent: {
    color: "#4ECDC4",
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingTop: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: DS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(108,92,231,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    color: DS.white,
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "rgba(78,205,196,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleText: {
    color: "#4ECDC4",
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 1,
  },
  saveButton: {
    width: "100%",
    height: 52,
    marginTop: 8,
    marginBottom: 28,
  },
  saveButtonText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: colors.purpleDark,
  },
  menuSection: {
    width: "100%",
    marginBottom: 20,
  },
  menuSectionLabel: {
    color: DS.textSec,
    fontSize: 12,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.15)",
    gap: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(108,92,231,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
    color: DS.white,
    fontSize: 15,
    fontFamily: "Montserrat-SemiBold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(229,62,62,0.12)",
    borderRadius: 14,
    padding: 16,
    width: "100%",
    gap: 10,
    marginTop: 4,
  },
  logoutText: {
    color: DS.danger,
    fontSize: 15,
    fontFamily: "Montserrat-SemiBold",
  },
});
