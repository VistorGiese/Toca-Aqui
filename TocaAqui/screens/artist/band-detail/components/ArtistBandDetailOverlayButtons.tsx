import React from "react";
import { TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
  onHome: () => void;
}

export default function ArtistBandDetailOverlayButtons({ onBack, onHome }: Props) {
  return (
    <>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <FontAwesome5 name="arrow-left" size={17} color={DS.white} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.homeButton} onPress={onHome}>
        <FontAwesome5 name="home" size={16} color={DS.white} />
      </TouchableOpacity>
    </>
  );
}
