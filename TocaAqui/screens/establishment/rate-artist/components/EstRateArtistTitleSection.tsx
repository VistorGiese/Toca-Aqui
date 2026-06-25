import React from "react";
import { Text } from "react-native";
import { styles } from "../styles";

interface Props {
  artistName: string;
  formattedDate: string;
}

export default function EstRateArtistTitleSection({ artistName, formattedDate }: Props) {
  return (
    <>
      <Text style={styles.title}>
        Como foi a performance de{"\n"}
        <Text style={styles.titleAccent}>{artistName}</Text>?
      </Text>
      {formattedDate ? <Text style={styles.dateText}>{formattedDate}</Text> : null}
    </>
  );
}
