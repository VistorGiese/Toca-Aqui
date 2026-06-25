import React from "react";
import { Text, View } from "react-native";
import { Gig } from "@/http/establishmentService";
import { ScheduleDayGroup } from "../types";
import EstScheduleGigCard from "./EstScheduleGigCard";
import { styles } from "../styles";

interface Props {
  groups: ScheduleDayGroup[];
  onGigPress: (gig: Gig) => void;
}

export default function EstScheduleList({ groups, onGigPress }: Props) {
  return (
    <View style={styles.list}>
      {groups.map((group) => (
        <View key={group.dateKey}>
          <Text style={styles.groupTitle}>{group.label}</Text>
          {group.gigs.map((gig) => (
            <EstScheduleGigCard key={gig.id} gig={gig} onPress={onGigPress} />
          ))}
        </View>
      ))}
    </View>
  );
}
