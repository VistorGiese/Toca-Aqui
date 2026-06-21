import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Linking,
  StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { resolveImageUrl } from "@/utils/adapters";
import { colors, getGenreColor } from "@/utils/colors";
import ProfileSectionCard from "@/components/artist/profile/ProfileSectionCard";
import ChipRow from "@/components/artist/profile/ChipRow";
import {
  TextEditModal,
  ChipSelectModal,
  CacheEditModal,
  LinksEditModal,
  SoundStructureModal,
  UnavailableDatesModal,
} from "@/components/artist/profile/ArtistProfileModals";
import { GENEROS_OPCOES, INSTRUMENTOS_OPCOES, EQUIPAMENTOS_OPCOES } from "@/constants/artistProfileOptions";
import { useArtistMyProfile } from "./useArtistMyProfile";

function formatCurrency(value?: number) {
  if (value == null || Number.isNaN(value)) return "A combinar";
  return `R$ ${Number(value).toLocaleString("pt-BR")}`;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "ArtistProfileManage">;

export default function ArtistProfileManage() {
  const navigation = useNavigation<NavProp>();
  const vm = useArtistMyProfile();
  const profile = vm.profile;

  const avatarUrl = resolveImageUrl(profile?.foto_perfil);

  if (vm.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purplePrimary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyRoot}>
        <FontAwesome5 name="user-music" size={42} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>Perfil de artista não encontrado</Text>
        <Text style={styles.emptyText}>
          Conclua o cadastro de artista nas configurações para visualizar seu perfil aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <FontAwesome5 name="arrow-left" size={16} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Editar perfil</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={() => vm.loadProfile(true)}
            tintColor={colors.purplePrimary}
          />
        }
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroOverlay} />
          <Text style={styles.brand}>MEU PERFIL</Text>
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={vm.pickAndUploadPhoto}
            disabled={vm.uploadingPhoto}
            activeOpacity={0.85}
          >
            {vm.uploadingPhoto ? (
              <ActivityIndicator color={colors.purpleLight} />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome5 name="user" size={32} color={colors.purpleLight} />
              </View>
            )}
            <View style={styles.photoBadge}>
              <FontAwesome5 name="camera" size={10} color={colors.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.artistName}>{profile.nome_artistico}</Text>
          {profile.tipo_atuacao ? (
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{profile.tipo_atuacao.toUpperCase()}</Text>
            </View>
          ) : null}
          {(profile.cidade || profile.estado) && (
            <View style={styles.locationRow}>
              <FontAwesome5 name="map-marker-alt" size={12} color={colors.textTertiary} />
              <Text style={styles.locationText}>
                {[profile.cidade, profile.estado].filter(Boolean).join(" · ")}
              </Text>
            </View>
          )}
        </View>

        {/* Stats (somente leitura) */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.shows_realizados}</Text>
            <Text style={styles.statLabel}>SHOWS{"\n"}REALIZADOS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile.nota_media != null ? Number(profile.nota_media).toFixed(1) : "—"}
            </Text>
            <Text style={styles.statLabel}>NOTA{"\n"}MÉDIA</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.esta_disponivel ? "SIM" : "NÃO"}</Text>
            <Text style={styles.statLabel}>DISPONÍVEL{"\n"}PARA SHOWS</Text>
          </View>
        </View>

        {/* Nome artístico */}
        <ProfileSectionCard
          title="Nome artístico"
          editable
          onEdit={() => vm.setActiveEdit("nome")}
        >
          <Text style={styles.bodyText}>{profile.nome_artistico}</Text>
        </ProfileSectionCard>

        {/* Bio */}
        <ProfileSectionCard title="Biografia" editable onEdit={() => vm.setActiveEdit("bio")}>
          <Text style={styles.bodyText}>
            {profile.biografia?.trim() || "Sem biografia — toque em Editar para contar sua história."}
          </Text>
        </ProfileSectionCard>

        {/* Gêneros */}
        <ProfileSectionCard title="Gêneros musicais" editable onEdit={() => vm.setActiveEdit("generos")}>
          {profile.generos.length > 0 ? (
            <View style={styles.chipsWrap}>
              {profile.generos.map((g) => (
                <View
                  key={g}
                  style={[styles.genreChip, { borderColor: getGenreColor(g) }]}
                >
                  <Text style={[styles.genreChipText, { color: getGenreColor(g) }]}>
                    {g.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <ChipRow items={[]} emptyLabel="Sem gêneros cadastrados" />
          )}
        </ProfileSectionCard>

        {/* Instrumentos */}
        <ProfileSectionCard
          title="Instrumentos"
          editable
          onEdit={() => vm.setActiveEdit("instrumentos")}
        >
          <ChipRow
            items={profile.instrumentos}
            emptyLabel="Sem instrumentos — toque em Editar para selecionar"
            accent={colors.cyan}
          />
        </ProfileSectionCard>

        {/* Experiência */}
        <ProfileSectionCard
          title="Anos de experiência"
          editable
          onEdit={() => vm.setActiveEdit("experiencia")}
        >
          <Text style={styles.bodyText}>
            {profile.anos_experiencia > 0
              ? `${profile.anos_experiencia} ${profile.anos_experiencia === 1 ? "ano" : "anos"}`
              : "Não informado"}
          </Text>
        </ProfileSectionCard>

        {/* Cachê */}
        <ProfileSectionCard title="Faixa de cachê" editable onEdit={() => vm.setActiveEdit("cache")}>
          <View style={styles.cacheRow}>
            <View style={styles.cacheCard}>
              <Text style={styles.cacheLabel}>MÍNIMO</Text>
              <Text style={styles.cacheValue}>{formatCurrency(profile.cache_minimo)}</Text>
            </View>
            <FontAwesome5 name="long-arrow-alt-right" size={14} color={colors.textTertiary} />
            <View style={styles.cacheCard}>
              <Text style={styles.cacheLabel}>MÁXIMO</Text>
              <Text style={styles.cacheValue}>{formatCurrency(profile.cache_maximo)}</Text>
            </View>
          </View>
        </ProfileSectionCard>

        {/* Estrutura de som */}
        <ProfileSectionCard
          title="Estrutura de som"
          editable
          onEdit={() => vm.setActiveEdit("som")}
          hint={profile.tem_estrutura_som ? "Possui equipamento próprio" : "Sem estrutura própria"}
        >
          <InfoLine
            label="Status"
            value={profile.tem_estrutura_som ? "Possui estrutura" : "Não possui estrutura"}
          />
          <View style={{ marginTop: 10 }}>
            <Text style={styles.subLabel}>Equipamentos</Text>
            <ChipRow
              items={profile.estrutura_som}
              emptyLabel="Nenhum equipamento listado"
              accent={colors.green}
            />
          </View>
        </ProfileSectionCard>

        {/* Portfólio */}
        <ProfileSectionCard title="Portfólio online" editable onEdit={() => vm.setActiveEdit("portfolio")}>
          {profile.url_portfolio ? (
            <TouchableOpacity onPress={() => Linking.openURL(profile.url_portfolio!)}>
              <Text style={styles.linkText}>{profile.url_portfolio}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.mutedText}>Nenhuma URL cadastrada</Text>
          )}
        </ProfileSectionCard>

        {/* Links sociais */}
        <ProfileSectionCard title="Links sociais" editable onEdit={() => vm.setActiveEdit("links")}>
          {profile.links_sociais.length > 0 ? (
            profile.links_sociais.map((link) => (
              <TouchableOpacity key={link} onPress={() => Linking.openURL(link)} style={styles.linkItem}>
                <FontAwesome5 name="link" size={12} color={colors.purpleLight} />
                <Text style={styles.linkText} numberOfLines={1}>
                  {link}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.mutedText}>Nenhum link cadastrado</Text>
          )}
        </ProfileSectionCard>

        {/* Press kit */}
        <ProfileSectionCard title="Press kit">
          {profile.press_kit.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pressKitRow}>
              {profile.press_kit.map((path) => {
                const uri = resolveImageUrl(path);
                if (!uri) return null;
                const isRemoving = vm.removingPressKitPath === path;
                return (
                  <View key={path} style={styles.pressKitItem}>
                    <Image source={{ uri }} style={styles.pressKitImage} />
                    <TouchableOpacity
                      style={styles.pressKitDeleteBtn}
                      onPress={() => vm.removePressKitPhoto(path)}
                      disabled={isRemoving}
                      activeOpacity={0.85}
                    >
                      {isRemoving ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <FontAwesome5 name="trash-alt" size={12} color={colors.white} />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.mutedText}>Nenhuma foto no press kit</Text>
          )}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={vm.pickAndUploadPressKit}
            disabled={vm.uploadingPressKit}
            activeOpacity={0.85}
          >
            {vm.uploadingPressKit ? (
              <ActivityIndicator size="small" color={colors.purpleLight} />
            ) : (
              <>
                <FontAwesome5 name="images" size={13} color={colors.purpleLight} />
                <Text style={styles.secondaryBtnText}>Adicionar fotos</Text>
              </>
            )}
          </TouchableOpacity>
        </ProfileSectionCard>

        {/* Indisponibilidades */}
        <ProfileSectionCard
          title="Datas indisponíveis"
          editable
          onEdit={() => vm.setActiveEdit("indisponibilidades")}
        >
          <ChipRow
            items={profile.datas_indisponiveis}
            emptyLabel="Nenhuma data bloqueada"
            accent={colors.error}
          />
        </ProfileSectionCard>

      </ScrollView>

      {/* Modais de edição */}
      <TextEditModal
        visible={vm.activeEdit === "nome"}
        title="Nome artístico"
        label="Nome de palco"
        value={profile.nome_artistico}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(value) => vm.patchProfile({ nome_artistico: value })}
        maxLength={80}
      />

      <TextEditModal
        visible={vm.activeEdit === "bio"}
        title="Biografia"
        label="Conte sobre você e sua música"
        value={profile.biografia ?? ""}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(value) => vm.patchProfile({ biografia: value || undefined })}
        multiline
        maxLength={500}
      />

      <ChipSelectModal
        visible={vm.activeEdit === "instrumentos"}
        title="Instrumentos"
        options={INSTRUMENTOS_OPCOES}
        selected={profile.instrumentos}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(selected) => vm.patchProfile({ instrumentos: selected })}
      />

      <ChipSelectModal
        visible={vm.activeEdit === "generos"}
        title="Gêneros musicais"
        options={GENEROS_OPCOES}
        selected={profile.generos}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(selected) => vm.patchProfile({ generos: selected })}
      />

      <TextEditModal
        visible={vm.activeEdit === "experiencia"}
        title="Experiência"
        label="Anos de experiência"
        value={String(profile.anos_experiencia || "")}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(value) =>
          vm.patchProfile({ anos_experiencia: value ? parseInt(value, 10) : 0 })
        }
        keyboardType="numeric"
        placeholder="Ex: 5"
      />

      <CacheEditModal
        visible={vm.activeEdit === "cache"}
        cacheMin={profile.cache_minimo != null ? String(Math.round(profile.cache_minimo)) : ""}
        cacheMax={profile.cache_maximo != null ? String(Math.round(profile.cache_maximo)) : ""}
        onClose={() => vm.setActiveEdit(null)}
        onSave={async (min, max) => {
          await vm.patchProfile({
            cache_minimo: min ? Number(min) : undefined,
            cache_maximo: max ? Number(max) : undefined,
          });
        }}
      />

      <TextEditModal
        visible={vm.activeEdit === "portfolio"}
        title="Portfólio"
        label="URL do portfólio (HTTPS)"
        value={profile.url_portfolio ?? ""}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(value) => vm.patchProfile({ url_portfolio: value || undefined })}
        keyboardType="url"
        placeholder="https://..."
      />

      <LinksEditModal
        visible={vm.activeEdit === "links"}
        links={profile.links_sociais}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(links) => vm.patchProfile({ links_sociais: links })}
      />

      <SoundStructureModal
        visible={vm.activeEdit === "som"}
        temEstrutura={profile.tem_estrutura_som}
        equipamentos={profile.estrutura_som}
        options={EQUIPAMENTOS_OPCOES}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(temEstrutura, equipamentos) =>
          vm.patchProfile({
            tem_estrutura_som: temEstrutura,
            estrutura_som: equipamentos,
          })
        }
      />

      <UnavailableDatesModal
        visible={vm.activeEdit === "indisponibilidades"}
        dates={profile.datas_indisponiveis}
        onClose={() => vm.setActiveEdit(null)}
        onSave={(dates) => vm.updateIndisponibilidades(dates)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#16163A",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPlaceholder: { width: 40 },
  topBarTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyRoot: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: colors.white,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  scroll: { paddingBottom: 40 },
  hero: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#12122A",
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(123,97,255,0.06)",
  },
  brand: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: colors.purplePrimary,
    letterSpacing: 2,
    marginBottom: 20,
  },
  photoBtn: { position: "relative", marginBottom: 14 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.purplePrimary,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#16163A",
    borderWidth: 3,
    borderColor: colors.purplePrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  photoBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.purplePrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  artistName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  typePill: {
    backgroundColor: colors.accentSoftBg,
    borderWidth: 1,
    borderColor: colors.accentBorderSoft,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 8,
  },
  typePillText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: colors.purpleLight,
    letterSpacing: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: colors.textTertiary,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#16163A",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 18,
    color: colors.white,
  },
  statLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 8,
    color: colors.textSecondary,
    letterSpacing: 1,
    textAlign: "center",
    lineHeight: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 4,
  },
  bodyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  mutedText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.textTertiary,
    fontStyle: "italic",
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  genreChipText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  cacheRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cacheCard: {
    flex: 1,
    backgroundColor: "#12122A",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  cacheLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 9,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  cacheValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: colors.white,
  },
  infoLine: { gap: 4 },
  infoLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.textSecondary,
  },
  subLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  linkText: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: colors.purpleLight,
  },
  pressKitRow: { gap: 10, marginBottom: 12 },
  pressKitItem: {
    position: "relative",
  },
  pressKitImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#12122A",
  },
  pressKitDeleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.accentBorderSoft,
    backgroundColor: colors.accentSoftBg,
    borderRadius: 12,
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: colors.purpleLight,
  },
});
