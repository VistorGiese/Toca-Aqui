import { colors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import Button from "../components/Allcomponents/Button";
import Fund from "../components/Allcomponents/Fund";
import Input from "../components/Allcomponents/Input";
import ToBack from "../components/Allcomponents/ToBack";
import {
    AccontFormContext,
    AccountProps,
} from "../contexts/AccountFromContexto";
import { RootStackParamList } from "../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width, height } = Dimensions.get("window");

export default function RegisterPassword() {
    const navigation = useNavigation<NavigationProp>();
    const { accountFormData: formData, updateFormData } =
        useContext(AccontFormContext);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<AccountProps>({
        defaultValues: {
            password: formData.password || "",
        },
        mode: "onTouched",
    });

    const password = watch("password");
    const passwordConfirmRef = useRef<TextInput>(null);

    function handleNext(data: AccountProps) {
        updateFormData({ password: data.password });
        navigation.navigate("InformationPersonResponsible");
    }

    return (
        <View style={styles.container}>
            <Fund />
            <ToBack />

            <Text style={styles.title}>Crie sua Senha</Text>
            <Text style={styles.subtitle}>
                Escolha uma senha segura. Ela será usada para proteger sua conta.
            </Text>

            <Controller
                control={control}
                name="password"
                rules={{
                    required: "A senha é obrigatória",
                    minLength: {
                        value: 8,
                        message: "A senha deve ter no mínimo 8 caracteres",
                    },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                        inputRef={ref}
                        label="Senha"
                        iconName="lock"
                        placeholder="Digite sua senha"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.password?.message}
                        secureTextEntry
                        returnKeyType="next"
                        onSubmitEditing={() => passwordConfirmRef.current?.focus()}
                    />
                )}
            />

            <Controller
                control={control}
                name="passwordConfirm"
                rules={{
                    required: "A confirmação da senha é obrigatória",
                    validate: (value) =>
                        value === password || "As senhas não conferem",
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                        inputRef={(e) => {
                            ref(e);
                            passwordConfirmRef.current = e;
                        }}
                        label="Confirmar Senha"
                        iconName="lock-check"
                        placeholder="Confirme sua senha"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.passwordConfirm?.message}
                        secureTextEntry
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit(handleNext)}
                    />
                )}
            />

            <Button style={styles.button} onPress={handleSubmit(handleNext)}>
                <Text style={styles.buttonText}>Continuar</Text>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c0a37",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    image: {
        width: width * 0.6,
        height: height * 0.3,
        resizeMode: "contain",
        marginBottom: 30,
    },
    title: {
        fontSize: 25,
        fontFamily: "Montserrat-Bold",
        color: "#fff",
        textAlign: "left",
        marginBottom: 50,
        marginLeft: 15,
        alignSelf: "flex-start",
        width: "95%",
    },
    subtitle: {
        fontSize: 18,
        fontFamily: "Montserrat-Regular",
        color: "#ccc",
        marginBottom: 25,
        textAlign: "left",
        width: "95%",
    },
    button: {
        width: "95%",
        marginTop: 200,
        height: 60,
    },
    buttonText: {
        color: colors.purpleDark,
        fontSize: 22,
        fontFamily: "Montserrat-Bold",
    },
});
