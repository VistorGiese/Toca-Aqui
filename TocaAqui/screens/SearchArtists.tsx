import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { colors } from "@/utils/colors";
import CardArtistProfile from "../components/Allcomponents/CardArtistProfile";
import { RootStackParamList } from "../navigation/Navigate";
import { Artist, ARTISTS_LIST } from "../utils/ArtistProfileMock";

// Obtemos as dimensões da tela atual
const { width, height } = Dimensions.get('window');

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchArtists() {
    const navigation = useNavigation<SearchScreenNavigationProp>();

    const [searchQuery, setSearchQuery] = useState("");
    const [displayedArtists, setDisplayedArtists] = useState<Artist[]>(ARTISTS_LIST);

    const handleSearchInput = (text: string) => {
        setSearchQuery(text);

        if (text.trim() === "") {
            setDisplayedArtists(ARTISTS_LIST);
        } else {
            const filteredList = ARTISTS_LIST.filter((artist) =>
                artist.name.toLowerCase().includes(text.toLowerCase())
            );
            setDisplayedArtists(filteredList);
        }
    };

    const navigateToProfile = (artist: Artist) => {
        navigation.navigate("ArtistProfile", { artist } as never);
    };

    return (
        <View style={styles.mainContainer}>
            <Text style={styles.screenTitle}>PESQUISAR</Text>

            <View style={styles.searchSection}>
                <View style={styles.inputWrapper}>
                    <FontAwesome5 name="search" size={width * 0.045} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Pesquisar"
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={handleSearchInput}
                    />
                </View>

                <TouchableOpacity style={styles.filterButton}>
                    <FontAwesome5 name="filter" size={width * 0.045} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayedArtists}
                keyExtractor={(artist) => artist.id}
                renderItem={({ item }) => (
                    <CardArtistProfile artist={item} onPress={navigateToProfile} />
                )}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyListText}>Nenhum artista encontrado.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.purpleBlack,
        paddingHorizontal: width * 0.05, // 5% de padding lateral
        paddingTop: height * 0.08, // 8% de padding superior (área segura + espaço)
    },
    screenTitle: {
        fontSize: width * 0.08, // Fonte grande proporcional
        color: "#fff",
        fontFamily: "AkiraExpanded-Superbold",
        marginBottom: height * 0.03,
    },
    searchSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.035,
        gap: width * 0.03,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1C1C29",
        borderRadius: width * 0.04,
        paddingHorizontal: width * 0.04,
        height: height * 0.065, // Altura da barra proporcional
        borderWidth: 1,
        borderColor: "rgba(74, 0, 224, 0.3)",
    },
    searchIcon: {
        marginRight: width * 0.03,
    },
    textInput: {
        flex: 1,
        color: "#fff",
        fontFamily: "Montserrat-Medium",
        fontSize: width * 0.04,
    },
    filterButton: {
        backgroundColor: colors.purple,
        borderRadius: width * 0.04,
        height: height * 0.065, // Mesma altura do input
        width: height * 0.065, // Quadrado
        alignItems: "center",
        justifyContent: "center",
    },
    listPadding: {
        paddingBottom: height * 0.05,
    },
    emptyListText: {
        color: "#888",
        textAlign: "center",
        marginTop: height * 0.08,
        fontFamily: "Montserrat-Medium",
        fontSize: width * 0.04,
    },
});