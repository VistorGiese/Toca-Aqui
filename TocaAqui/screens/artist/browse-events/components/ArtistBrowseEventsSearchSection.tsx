import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export default function ArtistBrowseEventsSearchSection({ value, onChange }: Props) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchBar}>
        <FontAwesome5 name="search" size={14} color={DS.textDis} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por local ou cidade..."
          placeholderTextColor={DS.textDis}
          value={value}
          onChangeText={onChange}
        />
      </View>
      <TouchableOpacity style={styles.filterBtn}>
        <FontAwesome5 name="sliders-h" size={16} color={DS.white} />
      </TouchableOpacity>
    </View>
  );
}
