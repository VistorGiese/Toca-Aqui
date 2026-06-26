import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { INPUT_PLACEHOLDER, PUBLISH_BTN_TEXT } from "../constants";
import { styles } from "../styles";

type Props = {
  value: string;
  maxChars: number;
  commentError: string;
  publishing: boolean;
  onChangeText: (text: string) => void;
  onPublish: () => void;
};

export default function UserCommentsInputSection({
  value,
  maxChars,
  commentError,
  publishing,
  onChangeText,
  onPublish,
}: Props) {
  return (
    <View style={[styles.inputCard, commentError ? styles.inputCardError : null]}>
      <TextInput
        style={styles.commentInput}
        placeholder={INPUT_PLACEHOLDER}
        placeholderTextColor="#555577"
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <FieldError message={commentError} />
      <View style={styles.inputFooter}>
        <Text style={styles.charCounter}>
          {value.length}/{maxChars}
        </Text>
        <TouchableOpacity
          style={[styles.publishBtn, publishing && styles.publishBtnDisabled]}
          onPress={onPublish}
          disabled={publishing}
        >
          <Text style={styles.publishBtnText}>{PUBLISH_BTN_TEXT}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
