import { Control, FieldErrors } from "react-hook-form";

export type PayMethod = "card" | "pix";

export type CheckoutFormData = {
  nome: string;
  cpf: string;
  telefone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
};

export type CheckoutControl = Control<CheckoutFormData>;

export type CheckoutFieldErrors = FieldErrors<CheckoutFormData>;
