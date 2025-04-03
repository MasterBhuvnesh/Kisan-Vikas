import React from "react";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import {
  UserCircleIcon,
  PlusCircleIcon,
  BookmarkIcon,
} from "react-native-heroicons/outline";
import Foundation from "@expo/vector-icons/Foundation";
import { View } from "@/components/Themed";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: true,
          tabBarStyle: {
            position: "absolute",
            marginTop: 10,
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme ?? "light"].border,
            elevation: 0,
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
          tabBarPosition: "bottom",
          tabBarButton: (props) => (
            <Pressable
              {...props}
              android_ripple={{ color: "transparent" }}
              style={({ pressed }) => [
                props.style,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarShowLabel: false,
            tabBarLabelStyle: {
              fontFamily: "Poppins",
            },
            tabBarIcon: ({ color }) => (
              <Foundation
                name="home"
                size={25}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: "Save",
            tabBarShowLabel: false,
            tabBarLabelStyle: {
              fontFamily: "Poppins",
            },
            tabBarIcon: ({ color }) => (
              <BookmarkIcon
                size={25}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarShowLabel: false,
            tabBarLabelStyle: {
              fontFamily: "Poppins",
            },
            tabBarIcon: ({ color }) => (
              <UserCircleIcon
                size={25}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
