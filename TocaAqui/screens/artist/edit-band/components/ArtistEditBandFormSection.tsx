import React from "react";
import { Control, Controller } from "react-hook-form";
import Input from "@/components/ui/Input";
import { EditBandForm } from "../types";

interface Props {
  control: Control<EditBandForm>;
}

export default function ArtistEditBandFormSection({ control }: Props) {
  return (
    <>
      <Controller
        control={control}
        name="nome_banda"
        rules={{
          required: "Nome é obrigatório",
          maxLength: { value: 100, message: "Máximo 100 caracteres" },
        }}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error },
        }) => (
          <Input
            inputRef={ref}
            label="Nome da banda"
            iconName="music"
            placeholder="Ex: Os Incríveis"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={error?.message}
            app
          />
        )}
      />

      <Controller
        control={control}
        name="descricao"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Descrição"
            iconName="text"
            placeholder="Fale sobre a banda..."
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            multiline
            numberOfLines={4}
            app
            inputContainerStyle={{
              height: undefined,
              minHeight: 110,
              alignItems: "flex-start",
              paddingVertical: 12,
            }}
            style={{
              height: undefined,
              minHeight: 82,
              textAlignVertical: "top",
              color: "#fff",
            }}
          />
        )}
      />
    </>
  );
}
