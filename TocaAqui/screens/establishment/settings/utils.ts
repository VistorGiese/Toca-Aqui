import { EstablishmentMember, EstablishmentMembersResponse } from "@/http/establishmentService";

export function combineMembers(data: EstablishmentMembersResponse | null): EstablishmentMember[] {
  if (!data) return [];
  return [...(data.owner ? [data.owner] : []), ...data.members];
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const error = err as { response?: { data?: { message?: string; error?: string } } };
  return error?.response?.data?.message ?? error?.response?.data?.error ?? fallback;
}

export function getMemberInitial(name?: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?";
}
