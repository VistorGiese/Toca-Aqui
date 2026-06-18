import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/utils/colors";

type ShellProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  children: React.ReactNode;
};

export function EditModalShell({ visible, title, onClose, onSave, saving, children }: ShellProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome5 name="times" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.sheetBody}
            contentContainerStyle={styles.sheetBodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type TextEditProps = {
  visible: boolean;
  title: string;
  label: string;
  value: string;
  onClose: () => void;
  onSave: (value: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "url";
  maxLength?: number;
};

export function TextEditModal({
  visible,
  title,
  label,
  value,
  onClose,
  onSave,
  multiline,
  placeholder,
  keyboardType = "default",
  maxLength,
}: TextEditProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditModalShell visible={visible} title={title} onClose={onClose} onSave={handleSave} saving={saving}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={multiline ? 5 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={keyboardType === "url" ? "none" : "sentences"}
      />
    </EditModalShell>
  );
}

type ChipEditProps = {
  visible: boolean;
  title: string;
  options: string[];
  selected: string[];
  onClose: () => void;
  onSave: (selected: string[]) => Promise<void>;
};

export function ChipSelectModal({ visible, title, options, selected, onClose, onSave }: ChipEditProps) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setDraft(selected);
  }, [visible, selected]);

  function toggle(item: string) {
    setDraft((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditModalShell visible={visible} title={title} onClose={onClose} onSave={handleSave} saving={saving}>
      <Text style={styles.helper}>Selecione um ou mais itens</Text>
      <View style={styles.chipsWrap}>
        {options.map((option) => {
          const active = draft.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggle(option)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </EditModalShell>
  );
}

type CacheEditProps = {
  visible: boolean;
  cacheMin: string;
  cacheMax: string;
  onClose: () => void;
  onSave: (min: string, max: string) => Promise<void>;
};

export function CacheEditModal({ visible, cacheMin, cacheMax, onClose, onSave }: CacheEditProps) {
  const [min, setMin] = useState(cacheMin);
  const [max, setMax] = useState(cacheMax);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setMin(cacheMin);
      setMax(cacheMax);
    }
  }, [visible, cacheMin, cacheMax]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(min, max);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditModalShell visible={visible} title="Faixa de cachê" onClose={onClose} onSave={handleSave} saving={saving}>
      <Text style={styles.label}>Cachê mínimo (R$)</Text>
      <TextInput
        style={styles.input}
        value={min}
        onChangeText={(v) => setMin(v.replace(/[^0-9]/g, ""))}
        placeholder="Ex: 500"
        placeholderTextColor={colors.textTertiary}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Cachê máximo (R$)</Text>
      <TextInput
        style={styles.input}
        value={max}
        onChangeText={(v) => setMax(v.replace(/[^0-9]/g, ""))}
        placeholder="Ex: 2000"
        placeholderTextColor={colors.textTertiary}
        keyboardType="numeric"
      />
    </EditModalShell>
  );
}

type LinksEditProps = {
  visible: boolean;
  links: string[];
  onClose: () => void;
  onSave: (links: string[]) => Promise<void>;
};

export function LinksEditModal({ visible, links, onClose, onSave }: LinksEditProps) {
  const [draft, setDraft] = useState<string[]>(links);
  const [novoLink, setNovoLink] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(links);
      setNovoLink("");
    }
  }, [visible, links]);

  function addLink() {
    const trimmed = novoLink.trim();
    if (!trimmed) return;
    setDraft((prev) => [...prev, trimmed]);
    setNovoLink("");
  }

  function removeLink(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditModalShell visible={visible} title="Links sociais" onClose={onClose} onSave={handleSave} saving={saving}>
      {draft.map((link, index) => (
        <View key={`${link}-${index}`} style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1}>
            {link}
          </Text>
          <TouchableOpacity onPress={() => removeLink(index)}>
            <FontAwesome5 name="trash-alt" size={14} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}
      <TextInput
        style={styles.input}
        value={novoLink}
        onChangeText={setNovoLink}
        placeholder="https://instagram.com/seu_perfil"
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="none"
        keyboardType="url"
      />
      <TouchableOpacity style={styles.addLinkBtn} onPress={addLink} activeOpacity={0.85}>
        <FontAwesome5 name="plus" size={12} color={colors.purpleLight} />
        <Text style={styles.addLinkText}>Adicionar link</Text>
      </TouchableOpacity>
    </EditModalShell>
  );
}

type SoundEditProps = {
  visible: boolean;
  temEstrutura: boolean;
  equipamentos: string[];
  options: string[];
  onClose: () => void;
  onSave: (temEstrutura: boolean, equipamentos: string[]) => Promise<void>;
};

export function SoundStructureModal({
  visible,
  temEstrutura,
  equipamentos,
  options,
  onClose,
  onSave,
}: SoundEditProps) {
  const [temDraft, setTemDraft] = useState(temEstrutura);
  const [equipDraft, setEquipDraft] = useState<string[]>(equipamentos);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setTemDraft(temEstrutura);
      setEquipDraft(equipamentos);
    }
  }, [visible, temEstrutura, equipamentos]);

  function toggleEquip(item: string) {
    setEquipDraft((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(temDraft, equipDraft);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditModalShell
      visible={visible}
      title="Estrutura de som"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Possuo estrutura de som própria</Text>
        </View>
        <Switch
          value={temDraft}
          onValueChange={setTemDraft}
          trackColor={{ false: colors.textTertiary, true: colors.purplePrimary }}
          thumbColor={colors.white}
        />
      </View>
      <Text style={[styles.label, { marginTop: 20 }]}>Equipamentos</Text>
      <View style={styles.chipsWrap}>
        {options.map((option) => {
          const active = equipDraft.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleEquip(option)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </EditModalShell>
  );
}

type DatesEditProps = {
  visible: boolean;
  dates: string[];
  onClose: () => void;
  onSave: (dates: string[]) => Promise<void>;
};

export function UnavailableDatesModal({ visible, dates, onClose, onSave }: DatesEditProps) {
  const [draft, setDraft] = useState<string[]>(dates);
  const [novaData, setNovaData] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(dates);
      setNovaData("");
    }
  }, [visible, dates]);

  function addDate() {
    const trimmed = novaData.trim();
    if (!trimmed || draft.includes(trimmed)) return;
    setDraft((prev) => [...prev, trimmed].sort());
    setNovaData("");
  }

  function removeDate(value: string) {
    setDraft((prev) => prev.filter((d) => d !== value));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditModalShell
      visible={visible}
      title="Datas indisponíveis"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <Text style={styles.helper}>Use o formato AAAA-MM-DD (ex: 2026-07-15)</Text>
      {draft.map((date) => (
        <View key={date} style={styles.linkRow}>
          <Text style={styles.linkText}>{date}</Text>
          <TouchableOpacity onPress={() => removeDate(date)}>
            <FontAwesome5 name="trash-alt" size={14} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}
      <TextInput
        style={styles.input}
        value={novaData}
        onChangeText={setNovaData}
        placeholder="2026-07-15"
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.addLinkBtn} onPress={addDate} activeOpacity={0.85}>
        <FontAwesome5 name="plus" size={12} color={colors.purpleLight} />
        <Text style={styles.addLinkText}>Adicionar data</Text>
      </TouchableOpacity>
    </EditModalShell>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#12122A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: colors.white,
  },
  sheetBody: { maxHeight: 420 },
  sheetBodyContent: { paddingHorizontal: 20, paddingBottom: 12 },
  label: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  helper: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#1E1250",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: colors.white,
    marginBottom: 16,
  },
  textArea: { minHeight: 120, paddingTop: 12 },
  saveBtn: {
    marginHorizontal: 20,
    marginBottom: Platform.OS === "ios" ? 28 : 20,
    marginTop: 8,
    backgroundColor: colors.purplePrimary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: colors.white,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: "#16163A",
  },
  chipActive: {
    backgroundColor: colors.purplePrimary,
    borderColor: colors.purplePrimary,
  },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: { color: colors.white },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#16163A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: colors.textSecondary,
  },
  addLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  addLinkText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: colors.purpleLight,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: colors.white,
    marginBottom: 4,
  },
  switchHint: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 18,
  },
});
