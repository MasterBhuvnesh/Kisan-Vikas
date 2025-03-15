import { Link, router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import * as React from "react";
import { Text, View } from "@/components/Themed";
import { PoppinsText } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function NotFoundScreen() {
  const theme = useColorScheme();
  return (
    <>
      <Stack.Screen
        options={{
          title: "OOPs! ",
          headerTitleStyle: { fontFamily: "SpaceMono" },
          headerStyle: { backgroundColor: Colors[theme ?? "light"].background },
          headerTintColor: Colors[theme ?? "light"].text,
        }}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <PoppinsText style={{ fontSize: 16 }}>
          This screen doesn't exist.
        </PoppinsText>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{
            backgroundColor: Colors[theme ?? "light"].text,
            width: "90%",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <PoppinsText
            style={{
              color: Colors[theme ?? "light"].background,
            }}
          >
            Go to Home Page
          </PoppinsText>
        </TouchableOpacity>
      </View>
    </>
  );
}
