import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";

const MOCK_ARTIST_TYPES = [
  {
    type: "DJ",
    available: 172,
    icon: require("../../assets/images/All/DJ.png"),
  },
  {
    type: "BANDA",
    available: 172,
    icon: require("../../assets/images/All/banda.png"),
  },
  {
    type: "SOLO",
    available: 172,
    icon: require("../../assets/images/All/solo.png"),
  },
];

interface FindArtistCardProps {
  type: string;
  available: number;
  icon: any;
  onPress?: () => void;
}

const FindArtistCard: React.FC<FindArtistCardProps> = ({
  type,
  available,
  icon,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <Image source={icon} style={styles.cardIcon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{type}</Text>
        <Text style={styles.cardSubtitle}>{available} disponíveis</Text>
      </View>
      <Text style={styles.cardArrow}>→</Text>
    </TouchableOpacity>
  );
};

export default function FindArtistSection() {
  return (
    <View style={styles.sectionContainer}>
      {MOCK_ARTIST_TYPES.map((artist) => (
        <FindArtistCard
          key={artist.type}
          type={artist.type}
          available={artist.available}
          icon={artist.icon}
          onPress={() => console.log(`Pesquisando por ${artist.type}`)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    gap: 10,
    marginBottom: 50,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.purpleBlack,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  cardIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  cardSubtitle: {
    color: colors.neutral,
    fontFamily: "Montserrat-Medium",
    fontSize: 12,
  },
  cardArrow: {
    color: colors.purple,
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    marginLeft: "auto",
  },
});
