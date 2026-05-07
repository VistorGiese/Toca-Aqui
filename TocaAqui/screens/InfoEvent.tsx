import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "@/components/ui/Button";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function InfoEvent() {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Informações do Evento</Text>

            <View style={styles.buttonsContainer}>
                <Button
                    style={styles.button}
                    onPress={() => navigation.navigate("ArtistProfile")}
                >
                    <Text style={styles.buttonText}>Perfil do Cantor</Text>
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c0a37",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        color: "#ccc",
        marginBottom: 40,
        textAlign: "center",
    },
    buttonsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 20,
    },
    button: {
        width: "45%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#28024E",
        fontSize: 18,
        fontWeight: "bold",
    },
    TextExemplo: {
        color: "#fff",
        fontSize: 16,
        marginTop: 20,
        boxShadow: "0px 4px 6px rgba(242, 18, 18, 1)"
    },
});
