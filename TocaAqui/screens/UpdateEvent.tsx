import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils/colors";
import HorizontalCalendar from "@/components/Allcomponents/HorizontalCalendar";
import Input from "@/components/ui/Input";
import { bookingService, Booking } from "../http/bookingService";
import {
  convertUTCToLocalDate,
  formatDate,
} from "@/components/UpdateEvent/dateUtil";
import { validateEventForm } from "@/components/UpdateEvent/validation";
import TimeInput from "@/components/UpdateEvent/TimeInput";

interface Props {
  event: Booking;
  onFinish: (updatedEvent?: Booking) => void;
}

export default function UpdateEvent({ event, onFinish }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [timeSlot, setTimeSlot] = useState({ start: "", end: "" });
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    start?: string;
    end?: string;
  }>({});

  useEffect(() => {
    if (!event) return;

    setName(event.titulo_evento);
    setDesc(event.descricao_evento || "");
    setSelectedDate(formatDate(convertUTCToLocalDate(event.data_show)));
    setTimeSlot({
      start: event.horario_inicio.slice(0, 5),
      end: event.horario_fim.slice(0, 5),
    });
  }, [event]);

  const handleUpdate = async () => {
    const validationErrors = validateEventForm(
      name,
      timeSlot.start,
      timeSlot.end
    );
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setIsLoading(true);
    try {
      const updatedEvent = await bookingService.updateBooking(event.id, {
        titulo_evento: name,
        descricao_evento: desc,
        data_show: selectedDate,
        horario_inicio: timeSlot.start,
        horario_fim: timeSlot.end,
      });
      onFinish(updatedEvent);
    } catch (err: any) {
      setErrors({
        start:
          err.response?.data?.error || "Não foi possível atualizar o evento.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => onFinish()}>
        <Ionicons name="close-outline" size={32} color={colors.neutral} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 40 }}
      >
        <HorizontalCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <Input
          app
          label="Nome do Evento"
          placeholder="Quartou do João"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <Input
          app
          label="Descrição do Evento"
          placeholder="Descrição da Quartou do João"
          value={desc}
          onChangeText={setDesc}
        />

        <Text style={styles.subtitle}>Horário Disponível</Text>
        <View style={styles.timeSlot}>
          <Text style={styles.smallLabel}>Horário do evento</Text>
          <View style={styles.timeRow}>
            <TimeInput
              label="Início (HH:MM)"
              value={timeSlot.start}
              onChange={(val) =>
                setTimeSlot((prev) => ({ ...prev, start: val }))
              }
              error={errors.start}
            />
            <TimeInput
              label="Fim (HH:MM)"
              value={timeSlot.end}
              onChange={(val) => setTimeSlot((prev) => ({ ...prev, end: val }))}
              error={errors.end}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={() => onFinish()}
        >
          <Text style={styles.buttonTextCancel}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.confirm,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.purpleBlack} />
          ) : (
            <Text style={styles.buttonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  closeButton: { position: "absolute", top: -10, right: 0, zIndex: 10 },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#fff",
    marginBottom: 15,
    marginTop: 10,
  },
  smallLabel: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
    fontFamily: "Montserrat-Regular",
  },
  timeSlot: { marginBottom: 20 },
  timeRow: { flexDirection: "row", alignItems: "center" },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: "auto",
  },
  button: {
    flex: 1,
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  cancel: { borderWidth: 1, borderColor: colors.neutral, marginRight: 10 },
  confirm: { backgroundColor: colors.neutral, marginLeft: 10 },
  disabledButton: { backgroundColor: "#ccc" },
  buttonTextCancel: {
    color: colors.neutral,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  buttonText: {
    color: colors.purpleBlack,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
});
