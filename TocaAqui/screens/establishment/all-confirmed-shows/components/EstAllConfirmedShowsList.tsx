import React from "react";
import { ScrollView } from "react-native";
import { Show } from "@/http/showService";
import EstAllConfirmedShowCard from "./EstAllConfirmedShowCard";
import { styles } from "../styles";

interface Props {
  shows: Show[];
  onShowPress: (show: Show) => void;
}

export default function EstAllConfirmedShowsList({ shows, onShowPress }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {shows.map((show) => (
        <EstAllConfirmedShowCard key={show.id} show={show} onPress={onShowPress} />
      ))}
    </ScrollView>
  );
}
