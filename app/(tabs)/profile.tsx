import React, { useState, useEffect } from "react";
import { Pressable, ToastAndroid, Platform } from "react-native";
import { View } from "@/components/Themed";
import { MonoText } from "@/components/StyledText";
import { router, Stack } from "expo-router";
import { Image } from "expo-image";
import { supabase } from "@/lib/supabase";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { HashtagIcon } from "react-native-heroicons/outline";

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error);
  } else {
    router.replace("/login");
  }
};

export default function ProfileScreen() {
  const theme = useColorScheme();
  const [userData, setUserData] = useState<any>(null);

  const fetchUserData = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Error fetching authenticated user:", authError);
      return;
    }

    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }

      if (!data) {
        console.log("No user data found for the authenticated user");
        // Handle the case where no user data is found
        return;
      }

      setUserData(data);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Subscribe to realtime changes in the "users" table
    const subscription = supabase
      .channel("users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" }, // Listen to all changes (insert, update, delete) on the "users" table
        (payload) => {
          // If the updated user is the current user, refresh the data
          if ("id" in payload.new && payload.new.id === userData?.id) {
            fetchUserData();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [userData?.id]); // Only re-run the effect if the user ID changes

  if (!userData) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack.Screen
          options={{
            headerShown: false,
            headerTitleStyle: { fontFamily: "SpaceMono" },
            headerStyle: {
              backgroundColor: Colors[theme ?? "light"].background,
            },
            headerTintColor: Colors[theme ?? "light"].text,
          }}
        />
        <MonoText>Loading...</MonoText>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Hide the header */}
      <Stack.Screen
        options={{
          headerShown: false,
          headerTitleStyle: { fontFamily: "SpaceMono" },
          headerStyle: { backgroundColor: Colors[theme ?? "light"].background },
          headerTintColor: Colors[theme ?? "light"].text,
        }}
      />
      <View
        style={{
          width: "95%",
          backgroundColor: Colors[theme ?? "light"].background,
          borderWidth: 1,
          borderColor: Colors[theme ?? "light"].text,
          borderRadius: 15,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        {/* Hash Icon */}
        <View
          style={{
            alignSelf: "flex-end",
            width: 30,
            height: 30,
            backgroundColor: Colors[theme ?? "light"].text,
            marginTop: 20,
            marginRight: 20,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            borderCurve: "circular",
          }}
        >
          <HashtagIcon
            size={18}
            color={Colors[theme ?? "light"].background}
            onLongPress={() => {
              if (Platform.OS === "android") {
                ToastAndroid.showWithGravity(
                  `ID : ${userData.id}`,
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER
                );
              } else {
                alert(`ID : ${userData.id}`);
              }
            }}
            onPress={() => {
              if (Platform.OS === "android") {
                ToastAndroid.showWithGravity(
                  `Username: ${userData.username}`,
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER
                );
              } else {
                alert(`Username: ${userData.username}`);
              }
            }}
          />
        </View>

        {/* User Data */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 20,
            marginLeft: 20,
            marginBottom: 20,
            backgroundColor: "transparent",
          }}
        >
          {userData.profile_pic && (
            <Image
              source={{ uri: userData.profile_pic }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 50,
                marginRight: 15,
                borderWidth: 1,
                borderColor: Colors[theme ?? "light"].text,
              }}
              resizeMode="cover"
            />
          )}

          <View
            style={{
              flexDirection: "column",
              backgroundColor: "transparent",
            }}
          >
            <MonoText style={{ fontSize: 12 }}>{userData.fullname}</MonoText>
            <MonoText style={{ fontSize: 12 }}>{userData.email}</MonoText>
            <MonoText style={{ fontSize: 12 }}>
              DOB : {userData.date_of_birth}
            </MonoText>
          </View>
        </View>
      </View>

      {/* Update Button */}
      <Pressable
        onPress={() => {
          router.push("/edit-profile");
        }}
        style={{
          backgroundColor: Colors[theme ?? "light"].text,
          width: "50%",
          padding: 10,
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <MonoText
          style={{
            borderRadius: 5,
            color: Colors[theme ?? "light"].background,
          }}
        >
          Update
        </MonoText>
      </Pressable>

      {/* Reset Password Button */}
      <Pressable
        onPress={() => {
          router.push("/reset-password");
        }}
        style={{
          backgroundColor: Colors[theme ?? "light"].text,
          width: "50%",
          padding: 10,
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <MonoText
          style={{
            borderRadius: 5,
            color: Colors[theme ?? "light"].background,
          }}
        >
          Reset Password
        </MonoText>
      </Pressable>

      {/* Logout Button */}
      <Pressable
        onPress={handleLogout}
        style={{
          backgroundColor: Colors[theme ?? "light"].text,
          width: "50%",
          padding: 10,
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <MonoText
          style={{
            borderRadius: 5,
            color: Colors[theme ?? "light"].background,
          }}
        >
          Logout
        </MonoText>
      </Pressable>
    </View>
  );
}
