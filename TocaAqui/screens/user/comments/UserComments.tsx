import React from "react";
import { View, Text, StatusBar } from "react-native";
import {
  UserCommentsHeader,
  UserCommentsInputSection,
  UserCommentsList,
  UserCommentsLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useUserComments } from "./useUserComments";

export default function UserComments() {
  const vm = useUserComments();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserCommentsHeader onBack={vm.goBack} />

      <Text style={styles.showSubtitle} numberOfLines={1}>
        {vm.showTitle}
      </Text>

      <UserCommentsInputSection
        value={vm.newComment}
        maxChars={vm.maxChars}
        commentError={vm.commentError}
        publishing={vm.publishing}
        onChangeText={vm.setCommentText}
        onPublish={vm.handlePublish}
      />

      {vm.loading ? (
        <UserCommentsLoadingState />
      ) : (
        <UserCommentsList
          comentarios={vm.comentarios}
          currentUserId={vm.user?.id}
          deletingId={vm.deletingId}
          onConfirmDelete={vm.confirmDelete}
        />
      )}
    </View>
  );
}
