import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createDefaultWeekSchedule } from "../constants";
import {
  EstablishmentOnboardingDraft,
  INITIAL_DRAFT,
  WeekSchedule,
} from "./types";

interface EstablishmentOnboardingContextValue {
  draft: EstablishmentOnboardingDraft;
  updateDraft: (patch: Partial<EstablishmentOnboardingDraft>) => void;
  setWeekSchedule: (schedule: WeekSchedule) => void;
  resetDraft: () => void;
}

const EstablishmentOnboardingContext =
  createContext<EstablishmentOnboardingContextValue | null>(null);

function buildInitialDraft(): EstablishmentOnboardingDraft {
  return {
    ...INITIAL_DRAFT,
    diasHorarios: createDefaultWeekSchedule(),
  };
}

export function EstablishmentOnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<EstablishmentOnboardingDraft>(buildInitialDraft);

  const updateDraft = useCallback((patch: Partial<EstablishmentOnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const setWeekSchedule = useCallback((schedule: WeekSchedule) => {
    setDraft((prev) => ({ ...prev, diasHorarios: schedule }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(buildInitialDraft());
  }, []);

  const value = useMemo(
    () => ({ draft, updateDraft, setWeekSchedule, resetDraft }),
    [draft, updateDraft, setWeekSchedule, resetDraft]
  );

  return (
    <EstablishmentOnboardingContext.Provider value={value}>
      {children}
    </EstablishmentOnboardingContext.Provider>
  );
}

export function useEstablishmentOnboarding() {
  const ctx = useContext(EstablishmentOnboardingContext);
  if (!ctx) {
    throw new Error("useEstablishmentOnboarding must be used within EstablishmentOnboardingProvider");
  }
  return ctx;
}
