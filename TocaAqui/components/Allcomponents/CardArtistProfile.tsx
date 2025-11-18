import { colors } from "@/utils/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Artist } from "../../utils/ArtistProfileMock";

// Obtemos as dimensões da tela atual
const { width, height } = Dimensions.get('window');

interface CardArtistProfileProps {
    artist: Artist;
    onPress: (artist: Artist) => void;
}

export default function CardArtistProfile({ artist, onPress }: CardArtistProfileProps) {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: artist.imageUrl }} style={styles.cardImage} />
                <View style={styles.favoriteIconBadge}>
                    <FontAwesome5 name="star" solid size={width * 0.04} color="#FFE600" />
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.artistName}>{artist.name}</Text>

                <View style={styles.tagsContainer}>
                    {artist.instruments.slice(0, 3).map((instrument, index) => (
                        <View key={index} style={styles.tagBadge}>
                            <Text style={styles.tagText}>{instrument}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <FontAwesome5 name="microphone" solid size={width * 0.035} color="#888" />
                        <Text style={styles.infoText}>Artista</Text>
                    </View>

                    <View style={styles.ratingWrapper}>
                        <Text style={styles.ratingText}>{artist.rating.toFixed(1)}</Text>
                        <FontAwesome5 name="star" solid size={width * 0.035} color="#888" />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => onPress(artist)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.profileButtonText}>Ver perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "#1C1C29",
        borderRadius: width * 0.06, // Aprox 6% da largura
        marginBottom: height * 0.03, // Aprox 3% da altura
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    imageWrapper: {
        position: "relative",
    },
    cardImage: {
        width: "100%",
        height: height * 0.25, // 25% da altura da tela
        resizeMode: "cover",
    },
    favoriteIconBadge: {
        position: "absolute",
        top: width * 0.04,
        right: width * 0.04,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: width * 0.05,
        padding: width * 0.02,
    },
    cardContent: {
        padding: width * 0.05, // 5% da largura como padding interno
    },
    artistName: {
        color: "#fff",
        fontSize: width * 0.055, // Fonte proporcional à largura
        fontFamily: "AkiraExpanded-Superbold",
        marginBottom: height * 0.015,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: height * 0.02,
        gap: width * 0.02,
    },
    tagBadge: {
        backgroundColor: colors.purple,
        borderRadius: width * 0.02,
        paddingHorizontal: width * 0.03,
        paddingVertical: height * 0.008,
    },
    tagText: {
        color: "#fff",
        fontSize: width * 0.03,
        fontFamily: "Montserrat-SemiBold",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: height * 0.025,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.02,
    },
    infoText: {
        color: "#888",
        fontSize: width * 0.035,
        fontFamily: "Montserrat-Medium",
    },
    ratingWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.015,
    },
    ratingText: {
        color: "#ccc",
        fontSize: width * 0.04,
        fontFamily: "Montserrat-Bold",
    },
    profileButton: {
        backgroundColor: "transparent",
        borderColor: colors.purple,
        borderWidth: 2,
        borderRadius: width * 0.03,
        paddingVertical: height * 0.018,
        alignItems: "center",
    },
    profileButtonText: {
        color: colors.purple,
        fontSize: width * 0.04,
        fontFamily: "AkiraExpanded-Superbold",
    },
});