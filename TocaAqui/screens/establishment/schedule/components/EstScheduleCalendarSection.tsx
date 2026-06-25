import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, WEEKDAY_LABELS } from "../constants";
import { CalendarDay } from "../types";
import { formatMonthYear, chunkCalendarWeeks } from "../utils";
import { styles } from "../styles";

interface Props {
  viewYear: number;
  viewMonth: number;
  days: CalendarDay[];
  selectedDateKey: string | null;
  todayKey: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
  onClearDate: () => void;
}

export default function EstScheduleCalendarSection({
  viewYear,
  viewMonth,
  days,
  selectedDateKey,
  todayKey,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onClearDate,
}: Props) {
  return (
    <View style={styles.calendarSection}>
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.monthBtn} onPress={onPrevMonth}>
          <FontAwesome5 name="chevron-left" size={12} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonthYear(viewYear, viewMonth)}</Text>
        <TouchableOpacity style={styles.monthBtn} onPress={onNextMonth}>
          <FontAwesome5 name="chevron-right" size={12} color={DS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {chunkCalendarWeeks(days).map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              const selected = selectedDateKey === day.dateKey;
              const isToday = day.dateKey === todayKey;
              return (
                <TouchableOpacity
                  key={`${day.dateKey}-${weekIndex}-${dayIndex}`}
                  style={styles.dayCell}
                  onPress={() => day.inMonth && onSelectDate(day.dateKey)}
                  disabled={!day.inMonth}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.dayInner,
                      selected && styles.dayInnerSelected,
                      !selected && isToday && day.inMonth && styles.dayInnerToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !day.inMonth && styles.dayTextMuted,
                        selected && styles.dayTextSelected,
                      ]}
                    >
                      {day.date.getDate()}
                    </Text>
                  </View>
                  {day.hasEvents && day.inMonth ? <View style={styles.dayDot} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {selectedDateKey ? (
        <TouchableOpacity style={styles.clearDayBtn} onPress={onClearDate}>
          <Text style={styles.clearDayText}>Limpar filtro de data</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
