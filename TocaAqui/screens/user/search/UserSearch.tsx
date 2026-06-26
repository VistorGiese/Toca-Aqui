import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { FILTER_TABS, DS } from "./constants";
import { styles, emptyStyles } from "./styles";
import UserSearchShowCard from "./components/UserSearchShowCard";
import { useUserSearch } from "./useUserSearch";

export default function UserSearch() {
  const vm = useUserSearch();

  if (vm.loading) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.brandName}>TOCA AQUI</Text>
        <TouchableOpacity onPress={vm.goToNotifications} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <FontAwesome5 name="bell" size={18} color={DS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={14} color={DS.textDis} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar shows, artistas ou locais..."
            placeholderTextColor={DS.textDis}
            value={vm.searchText}
            onChangeText={vm.setSearchText}
          />
          {vm.searchText.length > 0 ? (
            <TouchableOpacity onPress={() => vm.setSearchText("")}>
              <FontAwesome5 name="times" size={12} color={DS.textDis} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <FontAwesome5 name="sliders-h" size={16} color={DS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, vm.activeTab === tab && styles.tabActive]}
            onPress={() => vm.setActiveTab(tab)}
          >
            <Text style={[styles.tabText, vm.activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={vm.filteredShows}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Shows disponíveis</Text>
            <Text style={styles.listCount}>{vm.filteredShows.length} encontrados</Text>
          </View>
        }
        renderItem={({ item }) => (
          <UserSearchShowCard show={item} onPress={() => vm.goToShowDetail(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} tintColor={DS.accent} />
        }
        ListEmptyComponent={
          <View style={emptyStyles.container}>
            <FontAwesome5 name="search" size={28} color={DS.textDis} />
            <Text style={emptyStyles.text}>Nenhum show encontrado</Text>
            <Text style={emptyStyles.subText}>
              Tente outro termo de busca ou altere os filtros acima.
            </Text>
          </View>
        }
      />
    </View>
  );
}
