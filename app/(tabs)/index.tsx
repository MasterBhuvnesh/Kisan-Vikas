import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { MonoText, PoppinsText } from "@/components/StyledText";
import { View } from "@/components/Themed";

export default function Index() {
  const theme = useColorScheme();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors[theme ?? "light"].background,
        }}
      >
        <Stack.Screen />

        <MonoText>Loading...</MonoText>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors[theme ?? "light"].background,
        marginBottom: 50,
      }}
    >
      <Stack.Screen
        options={{
          headerTitleStyle: { fontFamily: "SpaceMono" },
          headerStyle: { backgroundColor: Colors[theme ?? "light"].background },
          headerTintColor: Colors[theme ?? "light"].text,
        }}
      />

      <MonoText
        style={{
          fontSize: 45,
          marginBottom: 20,
        }}
      >
        SecureSync
      </MonoText>
      <PoppinsText
        style={{
          fontSize: 12,
          textAlign: "center",
          padding: 20,
        }}
      >
        A basic overview of the app's features and what I have used:{"\n"}- Expo
        Router for navigation{"\n"}- Expo Image for image handling, as it
        supports GIFs, which React Native doesn't{"\n"}- Expo Image Picker for
        image picking{"\n"}- Expo Document Picker for GIF picking{"\n"}-
        File-based routing{"\n"}- Theme-based color scheme{"\n"}- Supabase for
        auth and storage{"\n"}- Custom splash screen and app icon{"\n"}- Custom
        font{"\n"}- Custom components like View, Text, etc. to support Theme
        {"\n"}
      </PoppinsText>
    </View>
  );
}
