import { colors } from "@/utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import Button from "../components/Allcomponents/Button";
import Input from "../components/Allcomponents/Input";
import { AccountProps } from "../contexts/AccountFromContexto";
import { RootStackParamList } from "../navigation/Navigate";
import {
    deleteEstabelecimento,
    getEstabelecimentoProfile,
    updateEstabelecimento,
    updateEndereco,
} from "../http/RegisterService";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const formatPhone = (value: string = "") => {
    const cleaned = value.replace(/\D/g, "").slice(0, 11);
    if (cleaned.length > 7)
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
            7
        )}`;
    if (cleaned.length > 2) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length > 0) return `(${cleaned.slice(0, 2)}`;
    return cleaned;
};

const formatCep = (value: string = "") => {
    const cleaned = value.replace(/\D/g, "").slice(0, 8);
    if (cleaned.length > 5) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    return cleaned;
};

export default function Profile() {
    const navigation = useNavigation<NavigationProp>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enderecoId, setEnderecoId] = useState<number | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AccountProps>();

    const nomeDonoRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const celularRef = useRef<TextInput>(null);
    const cepRef = useRef<TextInput>(null);
    const estadoRef = useRef<TextInput>(null);
    const cidadeRef = useRef<TextInput>(null);
    const bairroRef = useRef<TextInput>(null);
    const ruaRef = useRef<TextInput>(null);
    const numeroRef = useRef<TextInput>(null);

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                navigation.replace("Login");
                return;
            }
            const data = await getEstabelecimentoProfile();
            setEnderecoId(data.endereco.id);
            reset({
                ...data.estabelecimento,
                ...data.endereco,
                celular_responsavel: formatPhone(
                    data.estabelecimento.celular_responsavel
                ),
                cep: formatCep(data.endereco.cep),
            });
        } catch (error) {
            console.error("Erro ao buscar dados do perfil:", error);
            Alert.alert("Erro", "Não foi possível carregar seus dados.");
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    }, [navigation, reset]);

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [fetchUserData])
    );

    const handleUpdate = async (data: AccountProps) => {
        if (!enderecoId) {
            Alert.alert("Erro", "ID do Endereço não encontrado para atualização.");
            return;
        }

        setIsSubmitting(true);
        try {
            const estabelecimentoPayload = {
                nome_estabelecimento: data.nome_estabelecimento,
                nome_dono: data.nome_dono,
                email_responsavel: data.email_responsavel,
                celular_responsavel: data.celular_responsavel?.replace(/\D/g, ""),
            };

            const enderecoPayload = {
                rua: data.rua,
                numero: data.numero,
                bairro: data.bairro,
                cidade: data.cidade,
                estado: data.estado,
                cep: data.cep,
            };

            await Promise.all([
                updateEstabelecimento(estabelecimentoPayload),
                updateEndereco(enderecoId, enderecoPayload),
            ]);

            Alert.alert("Sucesso", "Seus dados foram atualizados.");
        } catch (error) {
            console.error("Erro ao atualizar dados:", error);
            Alert.alert("Erro", "Não foi possível atualizar seus dados.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            // 1. Remove os dados
            await AsyncStorage.multiRemove(["token", "estabelecimentoId"]);

            // 2. Validação Simples: Confere se sumiu
            const checkToken = await AsyncStorage.getItem("token");
            console.log("Token existe? (Deve ser null):", checkToken);

            // 3. Redireciona
            navigation.replace("Login");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível sair.");
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirmar exclusão",
            "Tem certeza que deseja apagar sua conta? Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Apagar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteEstabelecimento();
                            await AsyncStorage.multiRemove(["token", "estabelecimentoId"]);
                            Alert.alert("Sucesso", "Sua conta foi apagada.");
                            navigation.replace("Login");
                        } catch (error) {
                            console.error("Erro ao apagar conta:", error);
                            Alert.alert("Erro", "Não foi possível apagar sua conta.");
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.purple} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Meu Perfil</Text>
                <Text style={styles.subtitle}>
                    Visualize ou edite suas informações abaixo.
                </Text>

                <Controller
                    control={control}
                    name="nome_estabelecimento"
                    rules={{ required: "O nome do estabelecimento é obrigatório" }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label="Nome do Estabelecimento"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.nome_estabelecimento?.message}
                            returnKeyType="next"
                            onSubmitEditing={() => nomeDonoRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="nome_dono"
                    rules={{ required: "O nome do responsável é obrigatório" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                nomeDonoRef.current = e;
                            }}
                            label="Nome do Responsável"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.nome_dono?.message}
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="email_responsavel"
                    rules={{ required: "O e-mail é obrigatório" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                emailRef.current = e;
                            }}
                            label="E-mail do Responsável"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.email_responsavel?.message}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => celularRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="celular_responsavel"
                    rules={{ required: "O celular é obrigatório" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                celularRef.current = e;
                            }}
                            label="Celular do Responsável"
                            value={value}
                            onChangeText={(text) => onChange(formatPhone(text))}
                            onBlur={onBlur}
                            error={errors.celular_responsavel?.message}
                            keyboardType="phone-pad"
                            maxLength={15}
                            returnKeyType="next"
                            onSubmitEditing={() => cepRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="cep"
                    rules={{ required: "O CEP é obrigatório" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                cepRef.current = e;
                            }}
                            label="CEP"
                            value={value}
                            onChangeText={(text) => onChange(formatCep(text))}
                            onBlur={onBlur}
                            error={errors.cep?.message}
                            keyboardType="numeric"
                            maxLength={9}
                            returnKeyType="next"
                            onSubmitEditing={() => estadoRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="estado"
                    rules={{ required: "O estado é obrigatório" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                estadoRef.current = e;
                            }}
                            label="Estado"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.estado?.message}
                            returnKeyType="next"
                            onSubmitEditing={() => cidadeRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="cidade"
                    rules={{ required: "A cidade é obrigatória" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                cidadeRef.current = e;
                            }}
                            label="Cidade"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.cidade?.message}
                            returnKeyType="next"
                            onSubmitEditing={() => bairroRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="bairro"
                    rules={{ required: "O bairro é obrigatório" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                bairroRef.current = e;
                            }}
                            label="Bairro"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.bairro?.message}
                            returnKeyType="next"
                            onSubmitEditing={() => ruaRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="rua"
                    rules={{ required: "A rua é obrigatória" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                ruaRef.current = e;
                            }}
                            label="Endereço"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.rua?.message}
                            returnKeyType="next"
                            onSubmitEditing={() => numeroRef.current?.focus()}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="numero"
                    rules={{ required: "O número é obrigatório" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            inputRef={(e) => {
                                ref(e);
                                numeroRef.current = e;
                            }}
                            label="Número"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.numero?.message}
                            keyboardType="numeric"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit(handleUpdate)}
                        />
                    )}
                />

                <View style={styles.buttonContainer}>
                    <Button
                        style={styles.saveButton}
                        onPress={handleSubmit(handleUpdate)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={colors.purpleDark} />
                        ) : (
                            <Text style={styles.buttonText}>Salvar Dados</Text>
                        )}
                    </Button>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.logoutButtonText}>Sair</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.deleteButtonText}>Apagar Conta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c0a37",
    },
    loaderContainer: {
        flex: 1,
        backgroundColor: "#1c0a37",
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#ccc",
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    saveButton: {
        width: "100%",
        height: 60,
    },
    buttonText: {
        color: colors.purpleDark,
        fontSize: 18,
        fontWeight: "bold",
    },
    logoutButton: {
        width: "100%",
        height: 60,
        marginTop: 15,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.purple,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: colors.purple,
        fontSize: 18,
        fontWeight: "bold",
    },
    deleteButton: {
        marginTop: 20,
    },
    deleteButtonText: {
        color: "#ff4d4d",
        fontSize: 16,
        textDecorationLine: "underline",
    },
});