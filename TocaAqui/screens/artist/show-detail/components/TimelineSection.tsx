import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { TimelineItemProps } from "../types";
import { styles, timelineItemStyles } from "../styles";

interface Props {
  formattedDate: string;
}

export default function TimelineItem({
  icon,
  iconColor,
  title,
  subtitle,
  done,
}: TimelineItemProps) {
  return (
    <View style={timelineItemStyles.item}>
      <FontAwesome5 name={icon as "circle"} size={20} color={iconColor} solid={done} />
      <View style={timelineItemStyles.textBlock}>
        <Text style={[timelineItemStyles.title, !done && { color: DS.textDis }]}>{title}</Text>
        <Text style={timelineItemStyles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export function TimelineSection({ formattedDate }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Timeline de Pagamento</Text>
      <View style={styles.timelineCard}>
        <TimelineItem
          icon="check-circle"
          iconColor={DS.accent}
          title="Agendado"
          subtitle={`Confirmado para ${formattedDate}`}
          done
        />
        <View style={styles.timelineLine} />
        <TimelineItem
          icon="check-circle"
          iconColor={DS.accent}
          title="Realizado"
          subtitle="Status atual: Aguardando check-in no local"
          done
        />
        <View style={styles.timelineLine} />
        <TimelineItem
          icon="circle"
          iconColor={DS.textDis}
          title="Pagamento Confirmado"
          subtitle="Previsão: após conclusão do show"
          done={false}
        />
      </View>
    </>
  );
}
