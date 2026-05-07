import React from "react";
import { TextInput } from "react-native";
import { Controller, Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form";
import Input from "./Input";

interface FormFieldProps<T extends FieldValues> extends React.ComponentProps<typeof Input> {
  control: Control<T>;
  name: FieldPath<T>;
  rules?: RegisterOptions<T, FieldPath<T>>;
  onMount?: (el: TextInput | null) => void;
}

export default function FormField<T extends FieldValues>({
  control,
  name,
  rules,
  onMount,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <Input
          inputRef={(el) => { ref(el); onMount?.(el); }}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          error={error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
