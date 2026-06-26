import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Show } from "@/http/showService";
import ArtistHomeShowCard from "./ArtistHomeShowCard";
import { styles } from "../styles";

interface Props {
  shows: Show[];
  onViewAll: () => void;
  onShowPress: (show: Show) => void;
}

export default function ArtistHomeUpcomingShowsSection({ shows, onViewAll, onShowPress }: Props) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Próximos Shows</Text>
        <TouchableOpacity onPress={onViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.sectionLink}>VER TODOS</Text>
        </TouchableOpacity>
      </View>

      {shows.length === 0 ? (
        <Text style={styles.emptyShowsText}>Nenhum show confirmado.</Text>
      ) : (
        shows.map((show) => (
          <ArtistHomeShowCard key={show.id} show={show} onPress={onShowPress} />
        ))
      )}
    </>
  );
}
