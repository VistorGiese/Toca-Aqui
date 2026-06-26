import React from "react";
import { View, Text, TextInput } from "react-native";
import { COMMENT_PLACEHOLDER } from "../constants";
import { styles } from "../styles";

type Props = {
  value: string;
  maxLength: number;
  onChange: (text: string) => void;
};

export default function UserRateShowCommentSection({
  value,
  maxLength,
  onChange,
}: Props) {
  return (
    <View style={styles.commentSection}>
      <TextInput
        style={styles.commentInput}
        placeholder={COMMENT_PLACEHOLDER}
        placeholderTextColor="#555577"
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text style={styles.commentCounter}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}
