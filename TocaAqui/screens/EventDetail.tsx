import { FontAwesome5 } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

import { formatDisplayDate } from "@/components/EventDetail/dateUtils";
import OptionsMenu from "@/components/EventDetail/OptionsMenu";
import { colors } from "@/utils/colors";
import { Booking, bookingService } from "../http/bookingService";
import { RootStackParamList } from "../navigation/Navigate";
import UpdateEvent from "./UpdateEvent";

import CardArtistProfile from "../components/Allcomponents/CardArtistProfile";
import { Artist, DEFAULT_EVENT } from "../utils/ArtistProfileMock";

const { width, height } = Dimensions.get("window");

type EventDetailRouteProp = RouteProp<RootStackParamList, "EventDetail">;
type EventNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EventDetail() {
  const navigation = useNavigation<EventNavigationProp>();
  const route = useRoute<EventDetailRouteProp>();

  const params = route.params as { event: Booking } | undefined;
  const initialEventData = params?.event || (DEFAULT_EVENT as unknown as Booking);

  const [eventDetails, setEventDetails] = useState<Booking>(initialEventData);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);

  const backgroundImageSource = require("../assets/images/All/imagem_bar.webp");

  const formattedDate = useMemo(
    () =>
      eventDetails.data_show
        ? formatDisplayDate(eventDetails.data_show)
        : "Data a definir",
    [eventDetails.data_show]
  );

  const toggleOptionsMenu = () => {
    setIsOptionsMenuVisible(!isOptionsMenuVisible);
  };

  const handleOpenEditModal = () => {
    setIsOptionsMenuVisible(false);
    setIsEditModalVisible(true);
  };

  const handleConfirmDelete = () => {
    setIsOptionsMenuVisible(false);
    Alert.alert(
      "Confirmar Exclusão",
      `Você tem certeza que deseja excluir o evento "${eventDetails.titulo_evento}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await bookingService.deleteBooking(eventDetails.id);
              Alert.alert("Sucesso!", "O evento foi excluído.");
              navigation.goBack();
            } catch {
              Alert.alert("Erro", "Não foi possível excluir o evento.");
            }
          },
        },
      ]
    );
  };

  const handleUpdateCompletion = (updatedEventData?: Booking) => {
    setIsEditModalVisible(false);
    if (updatedEventData) setEventDetails(updatedEventData);
  };

  const navigateToArtistProfile = (artist: Artist) => {
    navigation.navigate("ArtistProfile", { artist } as never);
  };

  const artistAdapter = useMemo((): Artist | null => {
    if (!eventDetails.banda) return null;

    return {
      id: eventDetails.banda.id || "temp-id",
      name: eventDetails.banda.nome_banda,
      imageUrl: eventDetails.banda.imagem,
      rating: 5.0,
      description: "Artista confirmado para este evento.",
      instruments: ["Sertanejo", "Ao Vivo"],
    };
  }, [eventDetails.banda]);

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={backgroundImageSource}
          style={styles.headerImageBackground}
        >
          <TouchableOpacity
            style={styles.backNavigationButton}
            onPress={() => navigation.navigate("HomePage")}
          >
            <FontAwesome5 name="arrow-left" size={width * 0.05} color="#fff" />
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.contentWrapper}>
          <View style={styles.titleRowContainer}>
            <Text style={styles.eventTitleText}>
              {eventDetails.titulo_evento}
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                onPress={toggleOptionsMenu}
                style={styles.optionsButton}
              >
                <FontAwesome5 name="pen" size={width * 0.045} color="#fff" />
              </TouchableOpacity>

              {isOptionsMenuVisible && (
                <OptionsMenu
                  onEdit={handleOpenEditModal}
                  onDelete={handleConfirmDelete}
                />
              )}
            </View>
          </View>

          <View style={styles.genreTagContainer}>
            <Text style={styles.genreTagText}>Sertanejo</Text>
          </View>

          <Text style={styles.eventDescriptionText}>
            {eventDetails.descricao_evento}
          </Text>

          <View style={styles.infoSectionContainer}>
            <View style={styles.infoItemRow}>
              <FontAwesome5
                name="calendar-alt"
                size={width * 0.04}
                color={colors.purple}
              />
              <Text style={styles.infoItemText}>{formattedDate}</Text>
            </View>
            <View style={styles.infoItemRow}>
              <FontAwesome5
                name="clock"
                size={width * 0.04}
                color={colors.purple}
              />
              <Text style={styles.infoItemText}>
                {eventDetails.horario_inicio || "--:--"} -{" "}
                {eventDetails.horario_fim || "--:--"}
              </Text>
            </View>
          </View>

          {artistAdapter ? (
            <View style={styles.artistCardWrapper}>
              <CardArtistProfile
                artist={artistAdapter}
                onPress={navigateToArtistProfile}
              />
            </View>
          ) : (
            <Text style={styles.emptyArtistText}>
              Ainda não há artistas confirmados para este evento.
            </Text>
          )}
        </View>
      </ScrollView>

      <Modal
        isVisible={isEditModalVisible}
        onBackdropPress={() => setIsEditModalVisible(false)}
        onSwipeComplete={() => setIsEditModalVisible(false)}
        swipeDirection="down"
        style={styles.bottomSheetModal}
      >
        <View style={styles.modalContentWrapper}>
          <UpdateEvent event={eventDetails} onFinish={handleUpdateCompletion} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.purpleBlack,
  },
  headerImageBackground: {
    width: "100%",
    height: height * 0.35,
  },
  backNavigationButton: {
    padding: width * 0.04,
    marginTop: height * 0.05,
    position: "absolute",
    left: width * 0.02,
    top: height * 0.01,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: width * 0.1,
  },
  contentWrapper: {
    backgroundColor: colors.purpleBlack,
    borderTopLeftRadius: width * 0.06,
    borderTopRightRadius: width * 0.06,
    marginTop: -height * 0.03,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.03,
    paddingBottom: height * 0.05,
  },
  titleRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.015,
  },
  eventTitleText: {
    fontSize: width * 0.07,
    color: "#fff",
    fontFamily: "AkiraExpanded-Superbold",
    flex: 1,
    marginRight: width * 0.03,
  },
  optionsContainer: {
    position: "relative",
  },
  optionsButton: {
    padding: width * 0.02,
  },
  genreTagContainer: {
    backgroundColor: "#EBB688",
    alignSelf: "flex-start",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.005,
    borderRadius: width * 0.04,
    marginBottom: height * 0.025,
  },
  genreTagText: {
    color: "#3F1D0B",
    fontFamily: "Montserrat-Bold",
    fontSize: width * 0.035,
  },
  eventDescriptionText: {
    color: "#ccc",
    fontSize: width * 0.038,
    lineHeight: height * 0.03,
    marginBottom: height * 0.03,
    fontFamily: "Montserrat-Medium",
  },
  infoSectionContainer: {
    marginBottom: height * 0.04,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
    paddingLeft: width * 0.04,
  },
  infoItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.012,
  },
  infoItemText: {
    color: colors.neutral,
    fontSize: width * 0.04,
    fontFamily: "Montserrat-Regular",
    marginLeft: width * 0.03,
  },
  artistCardWrapper: {
    marginTop: height * 0.01,
  },
  emptyArtistText: {
    color: "#a9a9a9",
    textAlign: "center",
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.02,
    fontSize: width * 0.038,
    fontFamily: "Montserrat-Medium",
    fontStyle: "italic",
  },
  bottomSheetModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContentWrapper: {
    backgroundColor: colors.purpleBlack2,
    height: "90%",
    padding: width * 0.05,
    borderTopLeftRadius: width * 0.06,
    borderTopRightRadius: width * 0.06,
  },
});