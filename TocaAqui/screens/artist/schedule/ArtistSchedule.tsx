import React from "react";
import { RefreshControl, ScrollView, StatusBar, View } from "react-native";
import {
  ArtistScheduleCalendarSection,
  ArtistScheduleEmptyState,
  ArtistScheduleFilterBar,
  ArtistScheduleHeader,
  ArtistScheduleList,
  ArtistScheduleLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useArtistSchedule } from "./useArtistSchedule";

export default function ArtistSchedule() {
  const vm = useArtistSchedule();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <View style={styles.header}>
        <ArtistScheduleHeader onBrowseEvents={vm.goToBrowseEvents} />
        <ArtistScheduleFilterBar filter={vm.filter} onChange={vm.setFilter} />
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
        <ArtistScheduleCalendarSection
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
          <ArtistScheduleLoadingState />
        ) : vm.filteredCount === 0 ? (
          <ArtistScheduleEmptyState />
        ) : (
          <ArtistScheduleList groups={vm.groups} onItemPress={vm.handleItemPress} />
        )}
      </ScrollView>
    </View>
  );
}
