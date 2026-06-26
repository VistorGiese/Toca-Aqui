import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import TagMusic from "./TagMusic";
import ArtistType from "./ArtistType";
import Stars from "./Stars";
import { colors } from "@/utils/colors";
import { Artist } from "@/components/Allcomponents/mockEvents";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function CardArtist({ artist }: { artist: Artist }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: artist.photoUrl }} style={styles.artistImage} />

      <TouchableOpacity style={styles.favoriteIcon}>
        <FontAwesome name="star-o" size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.containerContent}>
        <Text style={styles.containerTextName}>{artist.name}</Text>

        <View style={styles.containerTag}>
          {artist.genres.map((genre, index) => (
            <TagMusic key={index} genre={genre} />
          ))}
        </View>

        <View style={styles.containerInfo}>
          <ArtistType type={artist.artistType} />
          <Stars starNumber={artist.rating} />
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ver perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F001D",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    width: "70%",
  },
  artistImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  favoriteIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 100,
    padding: 5,
  },
  containerContent: {
    paddingHorizontal: "5%",
    gap: 8,
    paddingVertical: 15,
  },
  containerTextName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  containerTag: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 10,
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  button: {
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 20,
    borderColor: colors.neutral,
  },
  buttonText: {
    color: colors.neutral,
    textAlign: "center",
    fontFamily: "Montserrat",
    fontWeight: "600",
  },
});
