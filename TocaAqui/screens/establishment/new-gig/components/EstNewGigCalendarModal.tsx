import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  visible: boolean;
  dataISO: string;
  minDate: string;
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
}

export default function EstNewGigCalendarModal({
  visible,
  dataISO,
  minDate,
  onClose,
  onSelectDate,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.calendarSheet}>
          <Text style={styles.calendarTitle}>SELECIONAR DATA</Text>
          <Calendar
            minDate={minDate}
            onDayPress={(day) => onSelectDate(day.dateString)}
            markedDates={
              dataISO ? { [dataISO]: { selected: true, selectedColor: DS.accent } } : {}
            }
            theme={{
              backgroundColor: DS.card,
              calendarBackground: DS.card,
              dayTextColor: DS.textPrimary,
              textDisabledColor: DS.border,
              monthTextColor: DS.textPrimary,
              arrowColor: DS.accent,
              selectedDayBackgroundColor: DS.accent,
              selectedDayTextColor: DS.textPrimary,
              todayTextColor: DS.cyan,
              textSectionTitleColor: DS.textSecondary,
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
