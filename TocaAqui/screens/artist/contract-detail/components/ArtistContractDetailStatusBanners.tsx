import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, REJECT_BANNER_TEXT, WAIT_BANNER_TEXT } from "../constants";
import { styles } from "../styles";

interface Props {
  artistMustResubmit: boolean;
  artistCanSeeContract: boolean;
}

export default function ArtistContractDetailStatusBanners({
  artistMustResubmit,
  artistCanSeeContract,
}: Props) {
  if (artistMustResubmit) {
    return (
      <View style={styles.rejectBanner}>
        <FontAwesome5 name="exclamation-circle" size={14} color={DS.danger} />
        <Text style={styles.rejectBannerText}>{REJECT_BANNER_TEXT}</Text>
      </View>
    );
  }

  if (!artistCanSeeContract) {
    return (
      <View style={styles.waitBanner}>
        <FontAwesome5 name="clock" size={14} color={DS.amber} />
        <Text style={styles.waitBannerText}>{WAIT_BANNER_TEXT}</Text>
      </View>
    );
  }

  return null;
}
