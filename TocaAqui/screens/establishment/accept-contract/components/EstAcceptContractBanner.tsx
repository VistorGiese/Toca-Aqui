import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { BannerVariant } from "../types";
import { styles } from "../styles";

const BANNER_CONFIG: Record<
  BannerVariant,
  { icon: React.ComponentProps<typeof FontAwesome5>["name"]; color: string }
> = {
  closed: { icon: "lock", color: DS.amber },
  rejected: { icon: "user-times", color: DS.danger },
};

interface Props {
  variant: BannerVariant;
  message: string;
}

export default function EstAcceptContractBanner({ variant, message }: Props) {
  const config = BANNER_CONFIG[variant];

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: `${config.color}18`,
          borderColor: `${config.color}44`,
        },
      ]}
    >
      <FontAwesome5 name={config.icon} size={14} color={config.color} />
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}
