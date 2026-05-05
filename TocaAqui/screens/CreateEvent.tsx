import React, { useState } from "react";
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
import Input from "@/components/Allcomponents/Input";
import { bookingService } from "../http/bookingService";
import {
  TimeSlot,
  validateEventForm,
} from "@/components/CreateEvent/validation";
import { getLocalDateString } from "@/components/CreateEvent/dateUtil";
import TimeSlotInput from "@/components/CreateEvent/TimeSlotInput";

interface Props {
  onClose: () => void;
}

export default function CreateEvent({ onClose }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: Date.now(), start: "", end: "" },
  ]);
  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(new Date())
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const addTimeSlot = () =>
    timeSlots.length < 2 &&
    setTimeSlots((prev) => [...prev, { id: Date.now(), start: "", end: "" }]);

  const removeTimeSlot = (id: number) =>
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));

  const updateTimeSlot = (
    id: number,
    field: "start" | "end",
    value: string
  ) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  const handleCreateEvent = async () => {
    const validationErrors = validateEventForm(name, timeSlots);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        await Promise.all(
          timeSlots.map((slot) =>
            bookingService.createBooking({
              titulo_evento: name,
              descricao_evento: desc,
              data_show: selectedDate,
              horario_inicio: slot.start,
              horario_fim: slot.end,
              perfil_estabelecimento_id: 1, 
            })
          )
        );
        onClose();
      } catch (err: any) {
        console.error("❌ Status:", err.response?.status);
        console.error("❌ Resposta do servidor:", JSON.stringify(err.response?.data));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
          error={errors.desc}
        />

        <Text style={styles.subtitle}>Horários Disponíveis</Text>
        {timeSlots.map((slot, index) => (
          <TimeSlotInput
            key={slot.id}
            label={index === 0 ? "Primeiro horário" : "Segundo horário"}
            start={slot.start}
            end={slot.end}
            onChange={(field, val) => updateTimeSlot(slot.id, field, val)}
            onRemove={() => removeTimeSlot(slot.id)}
            showRemove={index > 0}
            error={errors.timeSlots?.[slot.id]}
          />
        ))}
        {timeSlots.length < 2 && (
          <TouchableOpacity style={styles.addButton} onPress={addTimeSlot}>
            <Text style={styles.addButtonText}>Adicionar horário</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={onClose}
        >
          <Text style={styles.buttonTextCancel}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.confirm,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleCreateEvent}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.purpleBlack} />
          ) : (
            <Text style={styles.buttonText}>Agendar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeButton: { position: "absolute", top: 0, right: 0, zIndex: 10 },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#fff",
    marginBottom: 15,
    marginTop: 10,
  },
  addButton: {
    borderWidth: 1,
    borderColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  addButtonText: {
    color: colors.neutral,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
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