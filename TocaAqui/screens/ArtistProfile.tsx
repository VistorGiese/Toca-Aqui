import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import api from "@/http/api";
import { userService } from "@/http/userService";
import { colors } from "@/utils/colors";

const { width, height } = Dimensions.get('window');

const BASE_URL = (api.defaults.baseURL as string) ?? "";

interface ArtistData {
    id: number;
    nome_artistico: string;
    biografia?: string;
    generos: string[];
    estrutura_som: string[];
    tipo_atuacao?: string;
    foto_perfil?: string;
    cidade?: string;
    estado?: string;
    cache_minimo?: number;
    cache_maximo?: number;
    links_sociais?: string[];
}

interface UserReview {
    id: string;
    userName: string;
    commentText: string;
    ratingScore: number;
    submissionDate: string;
}

function parseJson<T>(value: unknown, fallback: T): T {
    if (Array.isArray(value)) return value as unknown as T;
    if (typeof value === "string") {
        try { return JSON.parse(value) as T; } catch { return fallback; }
    }
    return fallback;
}

export default function ArtistProfile() {
    const navigation = useNavigation();

    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentCommentText, setCurrentCommentText] = useState("");
    const [currentRatingStars, setCurrentRatingStars] = useState(0);
    const [artistReviewsList, setArtistReviewsList] = useState<UserReview[]>([]);

    useEffect(() => {
        userService.getProfile().then((res) => {
            const raw = res.user.artist_profiles?.[0];
            if (!raw) return;
            setArtist({
                id: raw.id,
                nome_artistico: raw.nome_artistico,
                biografia: raw.biografia,
                generos: parseJson<string[]>(raw.generos, []),
                estrutura_som: parseJson<string[]>(raw.estrutura_som, []),
                tipo_atuacao: raw.tipo_atuacao,
                foto_perfil: raw.foto_perfil,
                cidade: raw.cidade,
                estado: raw.estado,
                cache_minimo: raw.cache_minimo,
                cache_maximo: raw.cache_maximo,
                links_sociais: parseJson<string[]>(raw.links_sociais, []),
            });
        }).catch(() => {
            Alert.alert("Erro", "Não foi possível carregar o perfil.");
        }).finally(() => setLoading(false));
    }, []);

    const getInstrumentIcon = (instrument: string) => {
        const lower = instrument.toLowerCase();
        if (lower.includes("dj") || lower.includes("controller")) return "headphones";
        if (lower.includes("piano") || lower.includes("teclado")) return "keyboard";
        if (lower.includes("mixer")) return "sliders-h";
        if (lower.includes("guitarra") || lower.includes("violão") || lower.includes("guitar")) return "guitar";
        if (lower.includes("micro")) return "microphone";
        if (lower.includes("bateria") || lower.includes("drum")) return "drum";
        return "music";
    };

    const renderStarsDisplay = (ratingValue: number, iconSize: number = width * 0.035) => {
        const starsComponents = [];
        const fullStarsCount = Math.floor(ratingValue);
        const hasHalfStar = ratingValue % 1 >= 0.5;
        const emptyStarsCount = 5 - fullStarsCount - (hasHalfStar ? 1 : 0);

        for (let i = 0; i < fullStarsCount; i++) {
            starsComponents.push(
                <FontAwesome5 key={`full_${i}`} name="star" solid size={iconSize} color="#FFE600" style={styles.starIconSpacing} />
            );
        }
        if (hasHalfStar) {
            starsComponents.push(
                <FontAwesome5 key="half" name="star-half-alt" solid size={iconSize} color="#FFE600" style={styles.starIconSpacing} />
            );
        }
        for (let i = 0; i < emptyStarsCount; i++) {
            starsComponents.push(
                <FontAwesome5 key={`empty_${i}`} name="star" size={iconSize} color="#999" style={styles.starIconSpacing} />
            );
        }
        return starsComponents;
    };

    const renderInteractiveStars = () => {
        const interactiveStars = [];
        for (let i = 1; i <= 5; i++) {
            interactiveStars.push(
                <TouchableOpacity key={i} onPress={() => setCurrentRatingStars(i)} activeOpacity={0.7}>
                    <FontAwesome5
                        name="star"
                        solid={i <= currentRatingStars}
                        size={width * 0.08}
                        color={i <= currentRatingStars ? "#FFE600" : "#555"}
                        style={styles.interactiveStarIconSpacing}
                    />
                </TouchableOpacity>
            );
        }
        return interactiveStars;
    };

    const handleSubmitReview = () => {
        if (currentCommentText.trim() === "" || currentRatingStars === 0) {
            Alert.alert("Atenção", "Por favor, escreva um comentário e selecione uma nota de 1 a 5 estrelas.");
            return;
        }
        const newReview: UserReview = {
            id: Date.now().toString(),
            userName: "Você",
            commentText: currentCommentText,
            ratingScore: currentRatingStars,
            submissionDate: new Date().toLocaleDateString("pt-BR"),
        };
        setArtistReviewsList([newReview, ...artistReviewsList]);
        setCurrentCommentText("");
        setCurrentRatingStars(0);
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={colors.purple} />
            </View>
        );
    }

    if (!artist) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "#fff", fontFamily: "Montserrat-Regular" }}>Perfil não encontrado.</Text>
            </View>
        );
    }

    const fotoUrl = artist.foto_perfil ? `${BASE_URL}/${artist.foto_perfil}` : undefined;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground
                    source={fotoUrl ? { uri: fotoUrl } : require('../assets/images/Login/Arrow.png')}
                    style={styles.artistImageBackground}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <FontAwesome5 name="arrow-left" size={width * 0.05} color="#ffffffff" />
                    </TouchableOpacity>
                </ImageBackground>

                <View style={styles.artistDetailsContainer}>
                    <View style={styles.nameAndRatingRow}>
                        <Text style={styles.artistName}>{artist.nome_artistico}</Text>
                    </View>

                    <View style={styles.artistTagsAndTypeRow}>
                        {artist.generos.slice(0, 2).map((g) => (
                            <View key={g} style={styles.tagBadge}>
                                <Text style={styles.tagText}>{g}</Text>
                            </View>
                        ))}
                        {artist.tipo_atuacao && (
                            <View style={styles.artistTypeContainer}>
                                <FontAwesome5 name="microphone" size={width * 0.04} color="#888" />
                                <Text style={styles.artistTypeText}>{artist.tipo_atuacao}</Text>
                            </View>
                        )}
                    </View>

                    {artist.cidade || artist.estado ? (
                        <View style={styles.locationRow}>
                            <FontAwesome5 name="map-marker-alt" size={width * 0.035} color="#888" />
                            <Text style={styles.locationText}>
                                {[artist.cidade, artist.estado].filter(Boolean).join(", ")}
                            </Text>
                        </View>
                    ) : null}

                    {artist.biografia ? (
                        <Text style={styles.artistDescription}>{artist.biografia}</Text>
                    ) : null}

                    {artist.estrutura_som.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Estrutura de Som</Text>
                            <View style={styles.instrumentsListSection}>
                                {artist.estrutura_som.map((item: string, index: number) => (
                                    <View style={styles.instrumentItemRow} key={index}>
                                        <FontAwesome5 name={getInstrumentIcon(item)} size={width * 0.04} color={colors.purple} />
                                        <Text style={styles.instrumentText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {(artist.cache_minimo || artist.cache_maximo) && (
                        <View style={styles.cacheRow}>
                            <FontAwesome5 name="dollar-sign" size={width * 0.035} color={colors.purple} />
                            <Text style={styles.cacheText}>
                                Cache:{" "}
                                {artist.cache_minimo && artist.cache_maximo
                                    ? `R$ ${Number(artist.cache_minimo).toLocaleString("pt-BR")} – R$ ${Number(artist.cache_maximo).toLocaleString("pt-BR")}`
                                    : artist.cache_minimo
                                    ? `A partir de R$ ${Number(artist.cache_minimo).toLocaleString("pt-BR")}`
                                    : `Até R$ ${Number(artist.cache_maximo).toLocaleString("pt-BR")}`}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Deixe sua avaliação</Text>
                    <View style={styles.userReviewInputCard}>
                        <Text style={styles.inputFieldLabel}>Sua nota:</Text>
                        <View style={styles.userInteractiveStarsContainer}>
                            {renderInteractiveStars()}
                        </View>
                        <Text style={styles.inputFieldLabel}>Seu comentário:</Text>
                        <TextInput
                            style={styles.commentInputField}
                            placeholder="Escreva aqui sua experiência..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={4}
                            value={currentCommentText}
                            onChangeText={setCurrentCommentText}
                        />
                        <TouchableOpacity style={styles.submitCommentButton} onPress={handleSubmitReview}>
                            <Text style={styles.submitCommentButtonText}>Enviar Comentário</Text>
                        </TouchableOpacity>
                    </View>

                    {artistReviewsList.length > 0 && (
                        <View style={styles.allReviewsContainer}>
                            <Text style={styles.sectionTitle}>Todos os comentários</Text>
                            {artistReviewsList.map((review) => (
                                <View key={review.id} style={styles.reviewDisplayCard}>
                                    <View style={styles.reviewDisplayHeader}>
                                        <Text style={styles.reviewerName}>{review.userName}</Text>
                                        <Text style={styles.reviewDate}>{review.submissionDate}</Text>
                                    </View>
                                    <View style={styles.reviewRatingRow}>
                                        {renderStarsDisplay(review.ratingScore, width * 0.03)}
                                    </View>
                                    <Text style={styles.reviewDisplayCommentText}>{review.commentText}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.purpleBlack,
    },
    artistImageBackground: {
        width: '100%',
        height: height * 0.35,
    },
    backButton: {
        padding: width * 0.04,
        marginTop: height * 0.05,
        position: "absolute",
        left: width * 0.01,
        top: height * 0.01,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: width * 0.1,
    },
    artistDetailsContainer: {
        backgroundColor: colors.purpleBlack,
        borderTopLeftRadius: width * 0.05,
        borderTopRightRadius: width * 0.05,
        marginTop: -height * 0.03,
        padding: width * 0.05,
        paddingBottom: height * 0.05,
    },
    nameAndRatingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: height * 0.01,
    },
    artistName: {
        fontSize: width * 0.07,
        color: "#fff",
        fontFamily: "AkiraExpanded-Superbold",
        flex: 1,
    },
    artistTagsAndTypeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.01,
        flexWrap: "wrap",
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
    artistTypeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.015,
    },
    artistTypeText: {
        color: "#888",
        fontSize: width * 0.038,
        fontFamily: "Montserrat-Medium",
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.02,
        marginBottom: height * 0.015,
    },
    locationText: {
        color: "#888",
        fontSize: width * 0.035,
        fontFamily: "Montserrat-Regular",
    },
    artistDescription: {
        color: "#ccc",
        fontSize: width * 0.038,
        lineHeight: height * 0.03,
        marginBottom: height * 0.02,
        fontFamily: "Montserrat-Medium",
    },
    sectionTitle: {
        color: "#fff",
        fontSize: width * 0.05,
        fontFamily: "AkiraExpanded-Superbold",
        marginBottom: height * 0.02,
        marginTop: height * 0.03,
    },
    instrumentsListSection: {
        paddingLeft: width * 0.04,
    },
    instrumentItemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.015,
        gap: width * 0.03,
    },
    instrumentText: {
        color: colors.neutral,
        fontSize: width * 0.04,
        fontFamily: "Montserrat-Regular",
    },
    cacheRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.02,
        marginTop: height * 0.01,
    },
    cacheText: {
        color: "#ccc",
        fontSize: width * 0.038,
        fontFamily: "Montserrat-Medium",
    },
    userReviewInputCard: {
        backgroundColor: "#1C1C29",
        padding: width * 0.05,
        borderRadius: width * 0.04,
        marginBottom: height * 0.03,
        marginTop: height * 0.02,
    },
    inputFieldLabel: {
        color: "#ccc",
        fontFamily: "Montserrat-Medium",
        marginBottom: height * 0.015,
        fontSize: width * 0.038,
    },
    userInteractiveStarsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: height * 0.03,
        gap: width * 0.02,
    },
    interactiveStarIconSpacing: {
        marginHorizontal: width * 0.005,
    },
    commentInputField: {
        backgroundColor: "#333",
        color: "#fff",
        borderRadius: width * 0.02,
        padding: width * 0.03,
        fontSize: width * 0.038,
        fontFamily: "Montserrat-Regular",
        textAlignVertical: "top",
        minHeight: height * 0.1,
    },
    submitCommentButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.purple,
        paddingVertical: height * 0.018,
        borderRadius: width * 0.02,
        alignItems: "center",
        marginTop: height * 0.025,
    },
    submitCommentButtonText: {
        color: colors.purple,
        fontSize: width * 0.035,
        fontFamily: "AkiraExpanded-Superbold",
    },
    allReviewsContainer: {
        marginTop: height * 0.03,
    },
    reviewDisplayCard: {
        backgroundColor: "#1C1C29",
        padding: width * 0.04,
        borderRadius: width * 0.03,
        marginBottom: height * 0.02,
        borderLeftWidth: 2,
        borderLeftColor: "#4A00E0",
    },
    reviewDisplayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: height * 0.008,
    },
    reviewerName: {
        color: "#fff",
        fontFamily: "Montserrat-Bold",
        fontSize: width * 0.038,
    },
    reviewDate: {
        color: "#666",
        fontSize: width * 0.03,
        fontFamily: "Montserrat-Regular",
    },
    reviewRatingRow: {
        flexDirection: "row",
        marginBottom: height * 0.012,
    },
    starIconSpacing: {
        marginRight: width * 0.005,
    },
    reviewDisplayCommentText: {
        color: "#ccc",
        fontFamily: "Montserrat-Regular",
        fontSize: width * 0.038,
        lineHeight: height * 0.025,
    },
});
