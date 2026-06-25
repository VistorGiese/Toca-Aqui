import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Show } from "@/http/showService";
import EstHomeShowCard from "./EstHomeShowCard";
import { styles } from "../styles";

interface Props {
  shows: Show[];
  onViewAll: () => void;
  onShowPress: (show: Show) => void;
}

export default function EstHomeUpcomingShowsSection({ shows, onViewAll, onShowPress }: Props) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Próximos Shows</Text>
        <TouchableOpacity onPress={onViewAll} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.sectionLink}>VER TODOS</Text>
        </TouchableOpacity>
      </View>
      {shows.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum show confirmado.</Text>
      ) : (
        shows.map((show) => (
          <EstHomeShowCard key={show.id} show={show} onPress={onShowPress} />
        ))
      )}
    </>
  );
}
