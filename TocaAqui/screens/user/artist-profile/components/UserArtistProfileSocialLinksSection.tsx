import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

interface Props {
  links: string[];
}

export default function UserArtistProfileSocialLinksSection({ links }: Props) {
  if (links.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Links sociais</Text>
      {links.map((link) => (
        <TouchableOpacity
          key={link}
          onPress={() => Linking.openURL(link).catch(() => {})}
          activeOpacity={0.8}
        >
          <Text style={styles.linkText}>{link}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
