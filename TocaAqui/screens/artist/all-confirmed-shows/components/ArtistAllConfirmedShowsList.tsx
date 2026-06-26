import React from "react";
import { ScrollView } from "react-native";
import { Show } from "@/http/showService";
import ArtistAllConfirmedShowCard from "./ArtistAllConfirmedShowCard";
import { styles } from "../styles";

interface Props {
  shows: Show[];
  onShowPress: (show: Show) => void;
}

export default function ArtistAllConfirmedShowsList({ shows, onShowPress }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {shows.map((show) => (
        <ArtistAllConfirmedShowCard key={show.id} show={show} onPress={onShowPress} />
      ))}
    </ScrollView>
  );
}
