import React from "react";
import { RefreshControl, ScrollView, StatusBar, View } from "react-native";
import {
  EstScheduleCalendarSection,
  EstScheduleEmptyState,
  EstScheduleFilterBar,
  EstScheduleHeader,
  EstScheduleList,
  EstScheduleLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstSchedule } from "./useEstSchedule";

export default function EstSchedule() {
  const vm = useEstSchedule();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <View style={styles.header}>
        <EstScheduleHeader onNewGig={vm.goToNewGig} />
        <EstScheduleFilterBar filter={vm.filter} onChange={vm.setFilter} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            tintColor={DS.accent}
          />
        }
      >
        <EstScheduleCalendarSection
          viewYear={vm.viewYear}
          viewMonth={vm.viewMonth}
          days={vm.calendarDays}
          selectedDateKey={vm.selectedDateKey}
          todayKey={vm.todayKey}
          onPrevMonth={vm.goToPrevMonth}
          onNextMonth={vm.goToNextMonth}
          onSelectDate={vm.selectDate}
          onClearDate={vm.clearSelectedDate}
        />

        {vm.loading ? (
          <EstScheduleLoadingState />
        ) : vm.filteredCount === 0 ? (
          <EstScheduleEmptyState />
        ) : (
          <EstScheduleList groups={vm.groups} onGigPress={vm.handleGigPress} />
        )}
      </ScrollView>
    </View>
  );
}
