export type ArtistScheduleItemKind = "contract" | "application";

export interface ArtistScheduleItem {
  key: string;
  kind: ArtistScheduleItemKind;
  contractId?: number;
  applicationId?: number;
  eventoId: number;
  title: string;
  subtitle?: string;
  dataShow: string;
  horarioInicio?: string;
  horarioFim?: string;
  statusLabel: string;
  statusColor: string;
}

export interface ArtistScheduleDayGroup {
  dateKey: string;
  label: string;
  items: ArtistScheduleItem[];
}
