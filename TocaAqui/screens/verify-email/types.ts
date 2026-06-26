export type VerifyEmailStatus = "loading" | "success" | "error";

export interface VerifyEmailState {
  status: VerifyEmailStatus;
  message: string;
}
