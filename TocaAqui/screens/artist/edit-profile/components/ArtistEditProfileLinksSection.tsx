import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  links: string[];
  novoLink: string;
  onNovoLinkChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function ArtistEditProfileLinksSection({
  links,
  novoLink,
  onNovoLinkChange,
  onAdd,
  onRemove,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Links sociais</Text>
      {links.map((link, index) => (
        <View key={`${link}-${index}`} style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1}>
            {link}
          </Text>
          <TouchableOpacity onPress={() => onRemove(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FontAwesome5 name="trash-alt" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
      <TextInput
        style={styles.input}
        value={novoLink}
        onChangeText={onNovoLinkChange}
        placeholder="https://instagram.com/seu_perfil"
        placeholderTextColor="#555577"
        autoCapitalize="none"
        keyboardType="url"
      />
      <TouchableOpacity style={styles.addLinkBtn} onPress={onAdd} activeOpacity={0.85}>
        <FontAwesome5 name="plus" size={12} color="#7B61FF" />
        <Text style={styles.addLinkText}>Adicionar link</Text>
      </TouchableOpacity>
    </>
  );
}
