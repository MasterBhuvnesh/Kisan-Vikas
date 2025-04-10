import React, { useState, useEffect } from "react";
import {
  Pressable,
  ToastAndroid,
  Platform,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { View } from "@/components/Themed";
import { MonoText } from "@/components/StyledText";
import { Link, Redirect, router, Stack } from "expo-router";
import { Image } from "expo-image";
import { supabase } from "@/lib/supabase";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import {
  Cog6ToothIcon,
  HashtagIcon,
  LanguageIcon,
  TrashIcon,
} from "react-native-heroicons/outline";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/context/languageContext";

interface User {
  id: string;
  fullname: string;
  fullname_Hindi: string | null;
  username: string;
  email: string;
  profile_pic: string | null;
}

interface Post {
  id: string;
  content: string | null;
  content_Hindi: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
}

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error);
  } else {
    router.replace("/login");
  }
};

export default function ProfileScreen() {
  const { language, setLanguage } = useLanguage();
  const theme = useColorScheme();
  const [userData, setUserData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const { session, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";

  // Helper function to get localized name
  const getLocalizedName = (user: User) => {
    return language === "hi" && user.fullname_Hindi
      ? user.fullname_Hindi
      : user.fullname;
  };

  const fetchUserData = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      <Redirect href="/login" />;
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
        return;
      }

      setUserData(data);
      fetchUserPosts(user.id);
    }
  };

  const fetchUserPosts = async (userId: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, content_Hindi") // Add content_Hindi to the select
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user posts:", error);
      return;
    }

    setUserPosts(data || []);
  };

  const handleDeletePost = async (postId: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(
        language === "en" ? "Deleting post..." : "पोस्ट हटाई जा रही है...",
        ToastAndroid.SHORT
      );
    }

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      if (Platform.OS === "android") {
        ToastAndroid.show(
          language === "en" ? "Error deleting post" : "पोस्ट हटाने में त्रुटि",
          ToastAndroid.SHORT
        );
      } else {
        alert(
          language === "en" ? "Error deleting post" : "पोस्ट हटाने में त्रुटि"
        );
      }
      return;
    }

    setUserPosts(userPosts.filter((post) => post.id !== postId));

    if (Platform.OS === "android") {
      ToastAndroid.show(
        language === "en"
          ? "Post deleted successfully"
          : "पोस्ट सफलतापूर्वक हटाई गई",
        ToastAndroid.SHORT
      );
    } else {
      alert(
        language === "en"
          ? "Post deleted successfully"
          : "पोस्ट सफलतापूर्वक हटाई गई"
      );
    }
  };

  const truncateText = (text: string) => {
    if (!text) return "";
    const words = text.split(" ");
    const truncated = words.slice(0, 5).join(" ");
    return words.length > 5 ? `${truncated}...` : truncated;
  };

  useEffect(() => {
    fetchUserData();

    const userSubscription = supabase
      .channel("users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          if ("id" in payload.new && payload.new.id === userData?.id) {
            fetchUserData();
          }
        }
      )
      .subscribe();

    const postsSubscription = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            if (
              "user_id" in payload.new &&
              payload.new.user_id === userData?.id
            ) {
              if (userData) {
                fetchUserPosts(userData.id);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      userSubscription.unsubscribe();
      postsSubscription.unsubscribe();
    };
  }, [userData?.id]);

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
        <ActivityIndicator
          size="large"
          color={Colors[theme ?? "light"].tint}
        />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

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
        <MonoText>
          {language === "en" ? "Loading..." : "लोड हो रहा है..."}
        </MonoText>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: Colors[theme ?? "light"].background,
        width: isWeb && !isMobile ? 400 : "100%",
        alignSelf: "center",
      }}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: language === "en" ? "Profile" : "प्रोफ़ाइल",
          headerTitleAlign: "left",
          headerTitleStyle: { fontFamily: "PoppinsBold" },
          headerStyle: { backgroundColor: Colors[theme ?? "light"].background },
          headerTintColor: Colors[theme ?? "light"].text,
          headerShadowVisible: false,
          headerRight(props) {
            return (
              <Pressable
                onPress={() => {
                  router.push("/edit-profile");
                }}
                style={{
                  padding: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  borderRadius: 50,
                  marginRight: 10,
                }}
              >
                <Cog6ToothIcon
                  size={25}
                  color={Colors[theme ?? "light"].text}
                />
              </Pressable>
            );
          },
        }}
      />

      {/* User Profile Card */}
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
          marginBottom: 20,
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
            <MonoText style={{ fontSize: 12 }}>
              {getLocalizedName(userData)}
            </MonoText>
            <MonoText style={{ fontSize: 12 }}>{userData.email}</MonoText>
          </View>
        </View>
      </View>

      {/* Buttons Container */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "90%",
          marginVertical: 20,
        }}
      >
        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={{
            backgroundColor: Colors[theme ?? "light"].text,
            width: "48%",
            padding: 10,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MonoText
            style={{
              borderRadius: 5,
              color: Colors[theme ?? "light"].background,
            }}
          >
            {language === "en" ? "Logout" : "लॉगआउट"}
          </MonoText>
        </Pressable>

        {/* Language Button */}
        <Pressable
          onPress={() => setLanguage(language === "en" ? "hi" : "en")}
          style={{
            backgroundColor: Colors[theme ?? "light"].text,
            width: "48%",
            padding: 10,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 5,
          }}
        >
          <LanguageIcon
            size={20}
            color={Colors[theme ?? "light"].background}
          />
          <MonoText
            style={{
              borderRadius: 5,
              color: Colors[theme ?? "light"].background,
            }}
          >
            {language === "en" ? "हिंदी" : "English"}
          </MonoText>
        </Pressable>
      </View>

      {/* User Posts List */}
      <View style={styles.postsContainer}>
        <MonoText style={styles.postsTitle}>
          {language === "en" ? "My Posts" : "मेरे पोस्ट"}
        </MonoText>

        {userPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MonoText>
              {language === "en" ? "No posts yet" : "अभी तक कोई पोस्ट नहीं"}
            </MonoText>
          </View>
        ) : (
          <FlatList
            data={userPosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.postItem,
                  {
                    backgroundColor: Colors[theme ?? "light"].background,
                  },
                ]}
              >
                <View style={styles.postContent}>
                  {/* Post Image */}
                  {item.image_url && (
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  )}

                  {/* Post Text */}
                  <View style={styles.postTextContainer}>
                    <MonoText style={styles.postText}>
                      {truncateText(
                        language === "hi" && item.content_Hindi
                          ? item.content_Hindi
                          : item.content || ""
                      )}
                    </MonoText>
                  </View>

                  {/* Delete Button */}
                  <Pressable
                    onPress={() => handleDeletePost(item.id)}
                    style={styles.deleteButton}
                  >
                    <TrashIcon
                      size={20}
                      color={Colors[theme ?? "light"].text}
                    />
                  </Pressable>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    width: "95%",
    flex: 1,
  },
  postsTitle: {
    fontSize: 16,
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "transparent",
  },
  listContent: {
    paddingBottom: 45,
  },
  postItem: {
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  postContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  postImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  postTextContainer: {
    flex: 1,
  },
  postText: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
