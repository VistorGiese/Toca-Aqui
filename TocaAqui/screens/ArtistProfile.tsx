import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
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

import { colors } from "@/utils/colors";
import EventLocationCard from "../components/Allcomponents/EventLocationCard"; // Importa o novo componente
import { Artist, DEFAULT_ARTIST } from "../utils/ArtistProfileMock";

const { width, height } = Dimensions.get('window');

interface UserReview {
    id: string;
    userName: string;
    commentText: string;
    ratingScore: number;
    submissionDate: string;
}

export default function ArtistProfile() {
    const navigation = useNavigation();
    const route = useRoute();

    const [currentCommentText, setCurrentCommentText] = useState("");
    const [currentRatingStars, setCurrentRatingStars] = useState(0);
    const [artistReviewsList, setArtistReviewsList] = useState<UserReview[]>([
        {
            id: "mock-review-1",
            userName: "Fã do Sertanejo",
            commentText: "Show inesquecível, lotou a casa.",
            ratingScore: 5,
            submissionDate: "01/01/2023",
        },
    ]);

    const routeParams = route.params as { artist: Artist } | undefined;
    const selectedArtist = routeParams?.artist || DEFAULT_ARTIST;

    const getInstrumentIcon = (instrument: string) => {
        switch (instrument.toLowerCase()) {
            case "dj controller":
                return "headphones";
            case "synthesizer":
                return "keyboard";
            case "piano":
                return "piano";
            case "mixer":
                return "sliders-h";
            case "guitar":
                return "guitar";
            case "microphone":
                return "microphone";
            case "violão":
                return "guitar";
            case "teclado":
                return "keyboard";
            case "bateria eletrônica":
                return "drum";
            case "sistema de in-ear":
                return "ear-muffs";
            default:
                return "music"; // Ícone padrão
        }
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
                <FontAwesome5 key={`empty_${i}`} name="star" regular size={iconSize} color="#999" style={styles.starIconSpacing} />
            );
        }
        return starsComponents;
    };

    const renderInteractiveStars = () => {
        const interactiveStars = [];
        for (let i = 1; i <= 5; i++) {
            interactiveStars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setCurrentRatingStars(i)}
                    activeOpacity={0.7}
                >
                    <FontAwesome5
                        name="star"
                        solid={i <= currentRatingStars}
                        regular={i > currentRatingStars}
                        size={width * 0.08}
                        color={i <= currentRatingStars ? "#FFE600" : "#555"}
                        style={styles.interactiveStarIconSpacing}
                    />
                </TouchableOpacity>
            );
        }
        return interactiveStars;
    };

    const handleHireArtist = () => {
        Alert.alert(
            "Contratar Artista",
            `Você iniciou o processo de contratação de ${selectedArtist.name}.`
        );
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

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground
                    source={{ uri: selectedArtist.imageUrl }}
                    style={styles.artistImageBackground}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <FontAwesome5 name="arrow-left" size={width * 0.05} color="#ffffffff" />
                    </TouchableOpacity>
                </ImageBackground>

                <View style={styles.artistDetailsContainer}>
                    <View style={styles.nameAndRatingRow}>
                        <Text style={styles.artistName}>{selectedArtist.name}</Text>
                        <View style={styles.artistRatingDisplay}>
                            <Text style={styles.artistRatingText}>5</Text>
                            <FontAwesome5 name="star" solid size={width * 0.04} color="#FFE600" />
                        </View>
                    </View>

                    <View style={styles.artistTagsAndTypeRow}>
                        <View style={styles.tagBadge}>
                            <Text style={styles.tagText}>Sertanejo</Text>
                        </View>
                        <View style={styles.artistTypeContainer}>
                            <FontAwesome5 name="microphone" solid size={width * 0.04} color="#888" />
                            <Text style={styles.artistTypeText}>Solo</Text>
                        </View>
                    </View>

                    <Text style={styles.artistDescription}>{selectedArtist.description}</Text>

                    <Text style={styles.sectionTitle}>Instrumentos Próprios</Text>
                    <View style={styles.instrumentsListSection}>
                        {selectedArtist.instruments.map((instrument: string, index: number) => (
                            <View style={styles.instrumentItemRow} key={index}>
                                <FontAwesome5 name={getInstrumentIcon(instrument)} size={width * 0.04} color={colors.purple} />
                                <Text style={styles.instrumentText}>{instrument}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.hireArtistButton} onPress={handleHireArtist}>
                        <Text style={styles.hireArtistButtonText}>Contratar</Text>
                    </TouchableOpacity>

                    {/* Card de Local/Evento */}
                    <EventLocationCard
                        locationName="Bar do Zé"
                        locationDetails="Campinas, São Paulo"
                        eventType="Sábado do Sertanejo"
                        imageUrl={require('../assets/images/Login/Arrow.png')} // Caminho para a imagem mock
                        rating={4.5}
                    />

                    {/* Seção de Avaliações e Comentários do Usuário */}
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

                    {/* Lista de Comentários Anteriores (se houver) */}
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
    },
    artistRatingDisplay: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.01,
    },
    artistRatingText: {
        color: "#fff",
        fontSize: width * 0.045,
        fontFamily: "Montserrat-Bold",
    },
    artistTagsAndTypeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.02,
        gap: width * 0.04,
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
    artistDescription: {
        color: "#ccc",
        fontSize: width * 0.038,
        lineHeight: height * 0.03,
        marginBottom: height * 0.04,
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
    hireArtistButton: {
        backgroundColor: colors.purple,
        paddingVertical: height * 0.02,
        borderRadius: width * 0.03,
        alignItems: "center",
        marginTop: height * 0.04,
    },
    hireArtistButtonText: {
        color: "#fff",
        fontSize: width * 0.045,
        fontFamily: "AkiraExpanded-Superbold",
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    singleReviewText: {
        flex: 1,
        color: '#ccc',
        fontSize: width * 0.04,
        fontFamily: 'Montserrat-Regular',
        marginLeft: width * 0.03,
    },
    singleReviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: width * 0.03,
    },
    singleReviewRatingText: {
        color: '#fff',
        fontSize: width * 0.04,
        fontFamily: 'Montserrat-Bold',
        marginRight: width * 0.01,
    },

    // Estilos para o formulário de avaliação do usuário
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

    // Estilos para a lista de comentários
    allReviewsContainer: {
        marginTop: height * 0.03,
    },
    reviewDisplayCard: {
        backgroundColor: "#1C1C29",
        padding: width * 0.04,
        borderRadius: width * 0.03,
        marginBottom: height * 0.02,
        borderLeftWidth: 2,
        borderLeftColor: "#4A00E0", // Cor de destaque para o comentário
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