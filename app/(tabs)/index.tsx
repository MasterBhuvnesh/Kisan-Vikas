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
    return null;
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
        Features to be added : {"\n"}- Dark mode {"\n"}- Route extra params
        management [web] {"\n"}- toast notification {"\n"} - icons
      </PoppinsText>
    </View>
  );
}
