import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  links: string[];
  novoLink: string;
  showLinkInput: boolean;
  onChangeNovoLink: (value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onToggleLinkInput: () => void;
}

export default function OnboardingArtistBioLinksSection({
  links,
  novoLink,
  showLinkInput,
  onChangeNovoLink,
  onAddLink,
  onRemoveLink,
  onToggleLinkInput,
}: Props) {
  return (
    <>
      <Text style={styles.fieldLabel}>LINKS & MÍDIA</Text>

      {links.map((link, index) => (
        <View key={`${link}-${index}`} style={styles.linkChip}>
          <FontAwesome5 name="link" size={12} color={DS.accentLight} />
          <Text style={styles.linkText} numberOfLines={1}>
            {link}
          </Text>
          <TouchableOpacity onPress={() => onRemoveLink(index)}>
            <FontAwesome5 name="times" size={12} color={DS.danger} />
          </TouchableOpacity>
        </View>
      ))}

      {showLinkInput && (
        <View style={styles.linkInputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="https://..."
            placeholderTextColor={DS.textDis}
            value={novoLink}
            onChangeText={onChangeNovoLink}
            autoCapitalize="none"
            keyboardType="url"
          />
          <TouchableOpacity style={styles.btnAddSmall} onPress={onAddLink}>
            <Text style={styles.btnAddSmallText}>ADD</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.btnOutline} onPress={onToggleLinkInput} activeOpacity={0.8}>
        <FontAwesome5 name="link" size={13} color={DS.accentLight} />
        <Text style={styles.btnOutlineText}>ADD SOCIAL LINK</Text>
      </TouchableOpacity>
    </>
  );
}
