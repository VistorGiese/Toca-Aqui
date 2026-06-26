import React from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ArtistSearchResult } from "@/http/artistService";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  memberSearch: string;
  searchResults: ArtistSearchResult[];
  selectedMembers: ArtistSearchResult[];
  isSearching: boolean;
  showDropdown: boolean;
  onSearchChange: (text: string) => void;
  onSelectMember: (artist: ArtistSearchResult) => void;
  onRemoveMember: (id: number) => void;
}

export default function ArtistCreateBandMembersSection({
  memberSearch,
  searchResults,
  selectedMembers,
  isSearching,
  showDropdown,
  onSearchChange,
  onSelectMember,
  onRemoveMember,
}: Props) {
  return (
    <View style={styles.memberSection}>
      <Text style={styles.fieldLabel}>Membros da banda</Text>
      <View style={styles.searchBox}>
        <FontAwesome5 name="search" size={14} color={DS.textSec} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar artista pelo nome..."
          placeholderTextColor={DS.textDis}
          value={memberSearch}
          onChangeText={onSearchChange}
        />
        {isSearching && <ActivityIndicator size="small" color={DS.accent} />}
      </View>
      {showDropdown && (
        <View style={styles.dropdown}>
          {searchResults.map((artist) => (
            <TouchableOpacity
              key={artist.id}
              style={styles.dropdownItem}
              onPress={() => onSelectMember(artist)}
            >
              <FontAwesome5 name="user" size={13} color={DS.textSec} />
              <Text style={styles.dropdownText}>{artist.nome_artistico}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {selectedMembers.length > 0 && (
        <View style={styles.chipsRow}>
          {selectedMembers.map((member) => (
            <View key={member.id} style={styles.memberChip}>
              <Text style={styles.memberChipText}>{member.nome_artistico}</Text>
              <TouchableOpacity onPress={() => onRemoveMember(member.id)}>
                <FontAwesome5 name="times" size={11} color={DS.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
