import { colors } from "@/utils/colors";
import React, { useContext, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Button from "../components/Allcomponents/Button";
import ToBack from "../components/Allcomponents/ToBack";
import { AccontFormContext } from "../contexts/AccountFromContexto";
import {
    createEndereco,
    createEstabelecimento,
    registerUser,
    loginEstabelecimento,
} from "../http/RegisterService";
import { router } from "expo-router";

export default function ConfirmRegister() {
    const { accountFormData } = useContext(AccontFormContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            await registerUser(accountFormData);

            const loginResponse = await loginEstabelecimento({
                email_responsavel: accountFormData.email_responsavel,
                senha: accountFormData.password,
            });

            if (!loginResponse.token) {
                throw new Error("Erro ao autenticar após cadastro.");
            }

            const enderecoPayload = {
                rua: accountFormData.rua,
                numero: accountFormData.numero,
                bairro: accountFormData.bairro,
                cidade: accountFormData.cidade,
                estado: accountFormData.estado,
                cep: accountFormData.cep,
            };

            const enderecoCriado = await createEndereco(enderecoPayload);
            const enderecoId = enderecoCriado.id;

            if (!enderecoId) {
                throw new Error("O ID do endereço não foi retornado.");
            }

            const estabelecimentoPayload = {
                ...accountFormData,
                endereco_id: enderecoId,
                horario_funcionamento_inicio: accountFormData.horario_funcionamento_inicio?.includes(
                    ":"
                )
                    ? accountFormData.horario_funcionamento_inicio
                    : `${accountFormData.horario_funcionamento_inicio}:00:00`,
                horario_funcionamento_fim: accountFormData.horario_funcionamento_fim?.includes(
                    ":"
                )
                    ? accountFormData.horario_funcionamento_fim
                    : `${accountFormData.horario_funcionamento_fim}:00:00`,
            };

            await createEstabelecimento(estabelecimentoPayload);

            Alert.alert("Sucesso!", "Cadastro realizado com sucesso!", [
                { text: "OK", onPress: () => router.push("/login" as any) },
            ]);
        } catch (error: any) {
            console.error(error);
            const msg =
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Verifique os dados.";
            Alert.alert("Erro no Cadastro", String(msg));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <ToBack />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>CONFIRMAR DADOS</Text>
                    <Text style={styles.subtitle}>
                        Revise todas as informações para garantir que estão corretas.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados de Acesso</Text>
                    <Text style={styles.text}>
                        Nome do estabelecimento: {accountFormData.nome_estabelecimento}
                    </Text>
                    <Text style={styles.text}>
                        Nome do responsável: {accountFormData.nome_dono}
                    </Text>
                    <Text style={styles.text}>
                        E-mail: {accountFormData.email_responsavel}
                    </Text>
                    <Text style={styles.text}>
                        Telefone: {accountFormData.celular_responsavel}
                    </Text>
                    <Text style={styles.text}>
                        Senha: {"*".repeat(accountFormData.password?.length || 0)}
                    </Text>
                    <Text style={styles.text}>
                        Início de atendimento: {accountFormData.horario_funcionamento_inicio}
                    </Text>
                    <Text style={styles.text}>
                        Fim de atendimento: {accountFormData.horario_funcionamento_fim}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados do Estabelecimento</Text>
                    <Text style={styles.text}>
                        Rua: {accountFormData.rua}, {accountFormData.numero}
                    </Text>
                    <Text style={styles.text}>Bairro: {accountFormData.bairro}</Text>
                    <Text style={styles.text}>
                        Cidade: {accountFormData.cidade} - {accountFormData.estado}
                    </Text>
                    <Text style={styles.text}>CEP: {accountFormData.cep}</Text>
                </View>

                <Button
                    style={styles.button}
                    onPress={handleFinalSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color={colors.purpleDark} />
                    ) : (
                        <Text style={styles.buttonText}>Confirmar e Finalizar</Text>
                    )}
                </Button>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c0a37",
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 100,
        paddingBottom: 80,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 35,
        fontFamily: "AkiraExpanded-Superbold",
        color: "#fff",
        textAlign: "left",
    },
    subtitle: {
        fontSize: 20,
        color: "#ccc",
        textAlign: "left",
    },
    section: {
        backgroundColor: "#31184a",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: "AkiraExpanded-Superbold",
        color: colors.purple,
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 5,
    },
    button: {
        width: "100%",
        height: 60,
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: colors.purpleDark,
        fontSize: 22,
        fontWeight: "bold",
    },
});