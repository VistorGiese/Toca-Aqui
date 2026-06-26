import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ATTENDEE_AVATAR_COLORS } from "../constants";
import { styles } from "../styles";

interface Props {
  attendees: number;
}

export default function UserShowDetailAttendeesSection({ attendees }: Props) {
  if (attendees <= 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quem vai</Text>
      <View style={styles.attendeesRow}>
        {[...Array(Math.min(5, attendees))].map((_, i) => (
          <View
            key={i}
            style={[
              styles.attendeeAvatar,
              {
                marginLeft: i === 0 ? 0 : -8,
                backgroundColor: ATTENDEE_AVATAR_COLORS[i],
              },
            ]}
          >
            <FontAwesome5 name="user" size={10} color="rgba(255,255,255,0.7)" />
          </View>
        ))}
        {attendees > 5 && (
          <Text style={styles.attendeesMore}>
            {" "}e mais {attendees - 5} pessoas
          </Text>
        )}
      </View>
    </View>
  );
}
