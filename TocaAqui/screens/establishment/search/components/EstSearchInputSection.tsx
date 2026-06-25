import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, SEARCH_PLACEHOLDER } from "../constants";
import { styles } from "../styles";

interface Props {
  query: string;
  onChange: (value: string) => void;
}

export default function EstSearchInputSection({ query, onChange }: Props) {
  return (
    <View style={styles.searchBox}>
      <FontAwesome5
        name="search"
        size={14}
        color={DS.textSecondary}
        style={{ marginRight: 10 }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={SEARCH_PLACEHOLDER}
        placeholderTextColor={DS.textSecondary}
        value={query}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query.length > 0 ? (
        <TouchableOpacity
          onPress={() => onChange("")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome5 name="times" size={14} color={DS.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
