import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

type Props = {
  onSettingsPress: () => void;
};

export default function UserFavoritesHeader({ onSettingsPress }: Props) {
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity>
          <FontAwesome5 name="ellipsis-v" size={18} color={DS.textSec} />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>TOCA AQUI</Text>
        <TouchableOpacity onPress={onSettingsPress}>
          <FontAwesome5 name="cog" size={18} color={DS.textSec} />
        </TouchableOpacity>
      </View>

      <View style={styles.pageTitleArea}>
        <Text style={styles.pageTitle}>Meus favoritos</Text>
        <Text style={styles.pageSubtitle}>Sua curadoria pessoal do universo sonoro.</Text>
      </View>
    </>
  );
}
