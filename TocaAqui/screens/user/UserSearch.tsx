import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getGenreColor, genreColors } from "@/utils/colors";
import { showService, Show } from "@/http/showService";

LocaleConfig.locales["pt-br"] = {
  monthNames: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
  monthNamesShort: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
  dayNames: ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],
  dayNamesShort: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

const RECENT_SEARCHES = ["Solomun Ibiza 2024", "Taylor Swift Eras Tour Venues"];
const POPULAR = ["Jazz Classics", "Tomorrowland", "Rock Nacional", "Samba & MPB"];

const TABS = ["SHOWS", "ARTISTS", "VENUES"];

function formatShowDate(dataShow: string, horarioInicio: string): string {
  try {
    const date = new Date(dataShow);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const dayName = days[date.getUTCDay()];
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const time = horarioInicio.slice(0, 5);
    return `${dayName}, ${day} ${month} • ${time}`;
  } catch {
    return dataShow;
  }
}

function formatPrice(preco?: number): string {
  if (preco === 0 || !preco) return "Gratuito";
  return `R$ ${preco}`;
}

export default function UserSearch() {
  const navigation = useNavigation<NavProp>();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("SHOWS");
  const [activeGenreFilter, setActiveGenreFilter] = useState<string | null>(null);
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [results, setResults] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasQuery = query.trim().length >= 2;

  const GENRES = Object.keys(genreColors);

  const filteredResults = results.filter((s) => {
    const dateMatch = selectedDate ? s.data_show?.startsWith(selectedDate) : true;
    const genreMatch = activeGenreFilter
      ? s.genero_musical?.toUpperCase() === activeGenreFilter.toUpperCase()
      : true;
    return dateMatch && genreMatch;
  });

  function formatDateLabel(iso: string): string {
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
  }

  const fetchResults = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const data = await showService.searchShows(q);
      // Backend retorna { tipo: 'shows', resultados: [...] } via spread no controller
      // Suportar também formatos legados: array direto ou { shows: [...] }
      const shows: Show[] = Array.isArray(data)
        ? data
        : (data?.resultados ?? data?.shows ?? data?.data ?? []);
      setResults(shows);
    } catch {
      Alert.alert("Erro", "Não foi possível buscar resultados.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(query.trim());
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchResults]);

  function goToDetail(showId: number) {
    navigation.navigate("UserShowDetail", { showId });
  }

  function handleClear() {
    setQuery("");
    setResults([]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <View style={styles.searchInputWrapper}>
          <FontAwesome5 name="search" size={14} color="#555577" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Artistas, shows, locais..."
            placeholderTextColor="#555577"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <FontAwesome5 name="times" size={14} color="#555577" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        <TouchableOpacity style={styles.filterPill}>
          <FontAwesome5 name="sliders-h" size={11} color="#A78BFA" />
          <Text style={styles.filterPillText}>Filters</Text>
        </TouchableOpacity>
        {activeGenreFilter ? (
          <TouchableOpacity
            style={[styles.filterPill, styles.filterPillActive]}
            onPress={() => setActiveGenreFilter(null)}
          >
            <FontAwesome5 name="music" size={10} color="#A78BFA" />
            <Text style={styles.filterPillActiveText}>{activeGenreFilter}</Text>
            <FontAwesome5 name="times" size={10} color="#A78BFA" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowGenrePicker(true)}
          >
            <FontAwesome5 name="music" size={11} color="#888" />
            <Text style={styles.filterPillText}>Gênero</Text>
            <FontAwesome5 name="chevron-down" size={10} color="#888" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        )}
        {selectedDate ? (
          <TouchableOpacity
            style={[styles.filterPill, styles.filterPillActive]}
            onPress={() => setSelectedDate(null)}
          >
            <FontAwesome5 name="calendar-alt" size={11} color="#A78BFA" />
            <Text style={styles.filterPillActiveText}>{formatDateLabel(selectedDate)}</Text>
            <FontAwesome5 name="times" size={10} color="#A78BFA" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowCalendar(true)}
          >
            <FontAwesome5 name="calendar-alt" size={11} color="#888" />
            <Text style={styles.filterPillText}>Data</Text>
            <FontAwesome5 name="chevron-down" size={10} color="#888" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        isVisible={showCalendar}
        onBackdropPress={() => setShowCalendar(false)}
        onBackButtonPress={() => setShowCalendar(false)}
        style={styles.modal}
        backdropOpacity={0.7}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.calendarSheet}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Filtrar por data</Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <FontAwesome5 name="times" size={16} color="#A0A0B8" />
            </TouchableOpacity>
          </View>
          <Calendar
            onDayPress={(day: { dateString: string }) => {
              setSelectedDate(day.dateString);
              setShowCalendar(false);
            }}
            markedDates={
              selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#A78BFA" } } : {}
            }
            theme={{
              backgroundColor: "#16163A",
              calendarBackground: "#16163A",
              textSectionTitleColor: "#A0A0B8",
              selectedDayBackgroundColor: "#A78BFA",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#A78BFA",
              dayTextColor: "#ffffff",
              textDisabledColor: "#555577",
              arrowColor: "#A78BFA",
              monthTextColor: "#ffffff",
              textDayFontFamily: "Montserrat-Regular",
              textMonthFontFamily: "Montserrat-Bold",
              textDayHeaderFontFamily: "Montserrat-SemiBold",
              textDayFontSize: 14,
              textMonthFontSize: 15,
              textDayHeaderFontSize: 12,
            }}
          />
          {selectedDate && (
            <TouchableOpacity
              style={styles.clearDateBtn}
              onPress={() => { setSelectedDate(null); setShowCalendar(false); }}
            >
              <Text style={styles.clearDateText}>Limpar filtro de data</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      <Modal
        isVisible={showGenrePicker}
        onBackdropPress={() => setShowGenrePicker(false)}
        onBackButtonPress={() => setShowGenrePicker(false)}
        style={styles.modal}
        backdropOpacity={0.7}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.calendarSheet}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Filtrar por gênero</Text>
            <TouchableOpacity onPress={() => setShowGenrePicker(false)}>
              <FontAwesome5 name="times" size={16} color="#A0A0B8" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.genreGrid}>
            {GENRES.map((genre) => {
              const color = genreColors[genre];
              const isActive = activeGenreFilter === genre;
              return (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genrePickerChip,
                    { borderColor: color },
                    isActive && { backgroundColor: color + "33" },
                  ]}
                  onPress={() => {
                    setActiveGenreFilter(isActive ? null : genre);
                    setShowGenrePicker(false);
                  }}
                >
                  <Text style={[styles.genrePickerChipText, { color }]}>{genre}</Text>
                  {isActive && (
                    <FontAwesome5 name="check" size={10} color={color} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {activeGenreFilter && (
            <TouchableOpacity
              style={styles.clearDateBtn}
              onPress={() => { setActiveGenreFilter(null); setShowGenrePicker(false); }}
            >
              <Text style={styles.clearDateText}>Limpar filtro de gênero</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {hasQuery ? (
        <>
          <View style={styles.tabsRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.resultsList}
            >
              {filteredResults.length === 0 ? (
                <Text style={styles.emptyResults}>
                  {selectedDate ? "Nenhum show nesta data" : "Nenhum resultado encontrado"}
                </Text>
              ) : (
                filteredResults.map((show) => {
                  const genre = show.genero_musical?.toUpperCase() ?? "";
                  const genreColor = getGenreColor(genre || "OUTROS");
                  const artists =
                    show.Contract?.Band?.nome_banda ?? "Artista";
                  const venue =
                    show.EstablishmentProfile?.nome_estabelecimento ?? "Local não informado";
                  const date = formatShowDate(show.data_show, show.horario_inicio);
                  const priceLabel = formatPrice(show.preco_ingresso_inteira);
                  const imageColor = genreColor + "44";

                  return (
                    <TouchableOpacity
                      key={show.id}
                      style={styles.resultCard}
                      onPress={() => goToDetail(show.id)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.resultImage, { backgroundColor: imageColor }]}>
                        <FontAwesome5 name="music" size={20} color="rgba(255,255,255,0.3)" />
                      </View>
                      <View style={styles.resultBody}>
                        <View
                          style={[
                            styles.genreBadge,
                            { backgroundColor: genreColor + "22" },
                          ]}
                        >
                          <Text style={[styles.genreBadgeText, { color: genreColor }]}>
                            {genre || "SHOW"}
                          </Text>
                        </View>
                        <Text style={styles.resultTitle}>{show.titulo_evento}</Text>
                        <Text style={styles.resultArtists}>{artists}</Text>
                        <View style={styles.resultMeta}>
                          <FontAwesome5 name="map-marker-alt" size={10} color="#555577" />
                          <Text style={styles.resultMetaText}>{venue}</Text>
                        </View>
                        <View style={styles.resultMeta}>
                          <FontAwesome5 name="clock" size={10} color="#555577" />
                          <Text style={styles.resultMetaText}>{date}</Text>
                        </View>
                        <View style={styles.resultFooter}>
                          <Text style={styles.resultPrice}>{priceLabel}</Text>
                          <TouchableOpacity
                            style={styles.buyBtn}
                            onPress={() => goToDetail(show.id)}
                          >
                            <Text style={styles.buyBtnText}>BUY TICKETS</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}
        </>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.emptyContent}
        >
          <Text style={styles.emptySection}>Buscas recentes</Text>
          {RECENT_SEARCHES.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.recentRow}
              onPress={() => setQuery(s)}
            >
              <FontAwesome5 name="history" size={14} color="#555577" />
              <Text style={styles.recentText}>{s}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.emptySection, { marginTop: 24 }]}>Populares agora</Text>
          <View style={styles.popularRow}>
            {POPULAR.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.popularChip}
                onPress={() => setQuery(p)}
              >
                <Text style={styles.popularChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#FFFFFF",
  },
  cancelText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: "#A78BFA",
  },
  filtersRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: "rgba(167,139,250,0.12)",
    borderColor: "#A78BFA",
  },
  filterPillText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#888",
  },
  filterPillActiveText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#A78BFA",
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#A78BFA" },
  tabText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: "#555577",
    letterSpacing: 1,
  },
  tabTextActive: { color: "#A78BFA" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  resultsList: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyResults: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: "#555577",
    textAlign: "center",
    marginTop: 40,
  },
  resultCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 12,
    overflow: "hidden",
  },
  resultImage: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  resultBody: { flex: 1, padding: 12 },
  genreBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 5,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
  resultTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  resultArtists: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#A78BFA",
    marginBottom: 6,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 3,
  },
  resultMetaText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A0A0B8",
  },
  resultFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  resultPrice: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#00C896",
  },
  buyBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buyBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  emptyContent: { paddingHorizontal: 20, paddingTop: 8 },
  emptySection: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  recentText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#A0A0B8",
  },
  popularRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  popularChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  popularChipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  calendarSheet: {
    backgroundColor: "#16163A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    marginBottom: 8,
  },
  calendarTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  clearDateBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
    marginHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "rgba(229,62,62,0.1)",
  },
  clearDateText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#E53E3E",
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  genrePickerChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  genrePickerChipText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
