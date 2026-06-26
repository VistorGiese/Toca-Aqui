import React from "react";
import { Text, TextInput } from "react-native";
import { COMMENT_PLACEHOLDER, DS } from "../constants";
import { styles } from "../styles";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CommentSection({ value, onChange }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Deixe um comentário</Text>
      <TextInput
        style={styles.input}
        placeholder={COMMENT_PLACEHOLDER}
        placeholderTextColor={DS.textDis}
        multiline
        numberOfLines={5}
        value={value}
        onChangeText={onChange}
        textAlignVertical="top"
      />
    </>
  );
}
