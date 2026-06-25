import React from "react";
import { Text } from "react-native";
import FieldError from "@/components/ui/FieldError";
import WeekScheduleEditor from "../../onboarding/components/WeekScheduleEditor";
import { WeekSchedule } from "../../onboarding/context/types";
import { styles } from "../styles";

interface Props {
  schedule: WeekSchedule;
  onToggleDay: (id: string) => void;
  onUpdateTime: (id: string, field: "inicio" | "fim", value: string) => void;
  error?: string;
}

export default function EstEditProfileScheduleSection({
  schedule,
  onToggleDay,
  onUpdateTime,
  error,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Dias e horários de shows</Text>
      <WeekScheduleEditor
        schedule={schedule}
        onToggleDay={onToggleDay}
        onUpdateTime={onUpdateTime}
        hasError={Boolean(error)}
      />
      <FieldError message={error} />
    </>
  );
}
