import React from "react";
import { Text, View } from "react-native";
import { ArtistScheduleDayGroup } from "../types";
import { ArtistScheduleItem } from "../types";
import ArtistScheduleItemCard from "./ArtistScheduleItemCard";
import { styles } from "../styles";

interface Props {
  groups: ArtistScheduleDayGroup[];
  onItemPress: (item: ArtistScheduleItem) => void;
}

export default function ArtistScheduleList({ groups, onItemPress }: Props) {
  return (
    <View style={styles.list}>
      {groups.map((group) => (
        <View key={group.dateKey}>
          <Text style={styles.groupTitle}>{group.label}</Text>
          {group.items.map((item) => (
            <ArtistScheduleItemCard key={item.key} item={item} onPress={onItemPress} />
          ))}
        </View>
      ))}
    </View>
  );
}
