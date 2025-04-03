import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Link, Stack } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Image } from "expo-image";
import { MonoText } from "@/components/StyledText";
import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import {
  PlusCircleIcon,
  ChatBubbleLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "react-native-heroicons/outline";
import { Platform } from "react-native";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    id: string;
    fullname: string;
    username: string;
    profile_pic: string | null;
  };
}

interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: {
    id: string;
    fullname: string;
    username: string;
    profile_pic: string | null;
  };
  is_saved?: boolean;
  comments?: Comment[];
  showComments?: boolean;
}

const DEFAULT_PROFILE_PIC = require("@/assets/images/user_pic.jpg");

export default function HomeScreen() {
  const theme = useColorScheme();
  const { session } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [addingComment, setAddingComment] = useState<{
    [key: string]: boolean;
  }>({});
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `*, 
          user:user_id (
            id,
            fullname,
            username,
            profile_pic
          )`
        )
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Initialize posts without comments
      let initialPosts: Post[] = postsData || [];

      // For non-logged in users, just show posts without saved status
      if (!session?.user.id) {
        setPosts(
          initialPosts.map((post) => ({
            ...post,
            comments: [],
            showComments: false,
          }))
        );
        return;
      }

      // For logged in users, check saved status
      const { data: savedData, error: savedError } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", session.user.id);

      if (savedError) throw savedError;

      const savedPostIds = savedData?.map((item) => item.post_id) || [];
      const postsWithSavedStatus = initialPosts.map((post) => ({
        ...post,
        is_saved: savedPostIds.includes(post.id),
        comments: [],
        showComments: false,
      }));

      setPosts(postsWithSavedStatus);

      // Fetch comments for each post
      await fetchCommentsForPosts(postsWithSavedStatus);

      const initialLoadingStates = postsWithSavedStatus.reduce((acc, post) => {
        if (post.user.profile_pic) {
          acc[post.id] = true;
        }
        return acc;
      }, {} as { [key: string]: boolean });

      setImageLoading(initialLoadingStates);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch posts");
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCommentsForPosts = async (postsToUpdate: Post[]) => {
    try {
      // Fetch comments for all posts at once with user details
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          post_id,
          user_id,
          user:user_id (
            id,
            fullname,
            username,
            profile_pic
          )
        `
        )
        .in(
          "post_id",
          postsToUpdate.map((post) => post.id)
        )
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Group comments by post_id
      const commentsByPostId: { [key: string]: Comment[] } = {};
      commentsData?.forEach((comment) => {
        const postId = comment.post_id;
        if (!commentsByPostId[postId]) {
          commentsByPostId[postId] = [];
        }
        commentsByPostId[postId].push({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user_id: comment.user_id,
          user: Array.isArray(comment.user) ? comment.user[0] : comment.user,
        });
      });

      // Update posts with their comments
      const updatedPosts = postsToUpdate.map((post) => ({
        ...post,
        comments: commentsByPostId[post.id] || [],
      }));

      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error fetching comments:", error);
      Alert.alert("Error", "Failed to fetch comments");
    }
  };

  const toggleSave = async (postId: string, currentlySaved: boolean) => {
    if (!session?.user.id) {
      Alert.alert("Please Login", "You need to log in to save posts");
      return;
    }

    try {
      if (currentlySaved) {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", session.user.id)
          .eq("post_id", postId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("saved_posts").insert({
          user_id: session.user.id,
          post_id: postId,
        });

        if (error) throw error;
      }

      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, is_saved: !currentlySaved } : post
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update save status");
      console.error(error);
    }
  };

  const toggleShowComments = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, showComments: !post.showComments }
          : post
      )
    );
  };

  const addComment = async (postId: string) => {
    if (!session?.user.id) {
      Alert.alert("Please Login", "You need to log in to comment");
      return;
    }

    const comment = commentText[postId];
    if (!comment || comment.trim() === "") {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    try {
      setAddingComment({ ...addingComment, [postId]: true });

      const { data, error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: session.user.id,
        content: comment,
      }).select(`
        id,
        content,
        created_at,
        user:user_id (
          id,
          fullname,
          username,
          profile_pic
        )
      `);

      if (error) throw error;

      if (data && data[0]) {
        const newComment: Comment = {
          id: data[0].id,
          content: data[0].content,
          created_at: data[0].created_at,
          user_id: session.user.id,
          user: Array.isArray(data[0].user) ? data[0].user[0] : data[0].user,
        };

        // Update the posts state with the new comment
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...(post.comments || []), newComment],
                  showComments: true, // Automatically show comments after adding
                }
              : post
          )
        );

        // Clear the comment input
        setCommentText({ ...commentText, [postId]: "" });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    } finally {
      setAddingComment({ ...addingComment, [postId]: false });
    }
  };

  const handleImageLoad = (postId: string) => {
    setImageLoading((prev) => ({ ...prev, [postId]: false }));
  };

  const handleImageError = (postId: string) => {
    setImageLoading((prev) => ({ ...prev, [postId]: false }));
  };

  useEffect(() => {
    fetchPosts();

    const postsSubscription = supabase
      .channel("posts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .subscribe();

    const commentsSubscription = supabase
      .channel("comments_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          // Only refetch comments for existing posts instead of all posts
          if (posts.length > 0) {
            fetchCommentsForPosts(posts);
          }
        }
      )
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [session]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[theme ?? "light"].background,
          flex: 1,
          width: "100%",
          maxWidth: isWeb && !isMobile ? 400 : "100%",
          alignSelf: isWeb && !isMobile ? "center" : "stretch",
        },
      ]}
    >
      <Stack.Screen
        options={{
          title: "Kisan Vikas",
          headerTitleStyle: { fontFamily: "PoppinsBold" },
          headerStyle: {
            backgroundColor: Colors[theme ?? "light"].background,
          },
          headerRight: () =>
            session ? (
              <Link
                href="/add-post"
                asChild
              >
                <Pressable>
                  {({ pressed }) => (
                    <PlusCircleIcon
                      size={25}
                      color={Colors[theme ?? "light"].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ) : null,
        }}
      />

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View
            style={[
              styles.postContainer,
              {
                backgroundColor: Colors[theme ?? "light"].background,
                borderColor: Colors[theme ?? "light"].border,
              },
            ]}
          >
            <View style={styles.userRow}>
              <View style={styles.profilePicContainer}>
                {imageLoading[item.id] && (
                  <ActivityIndicator
                    style={styles.loadingIndicator}
                    color={Colors[theme ?? "light"].text}
                  />
                )}
                <Image
                  source={
                    item.user.profile_pic
                      ? { uri: item.user.profile_pic }
                      : DEFAULT_PROFILE_PIC
                  }
                  style={styles.profilePic}
                  contentFit="cover"
                  onLoad={() => handleImageLoad(item.id)}
                  onError={() => handleImageError(item.id)}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {item.user.fullname || item.user.username}
                </Text>
                <Text style={styles.postTime}>
                  {dayjs(item.created_at).format("MMM D, YYYY [at] h:mm A")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleSave(item.id, item.is_saved || false)}
              >
                <FontAwesome
                  name={
                    session
                      ? item.is_saved
                        ? "bookmark"
                        : "bookmark-o"
                      : "bookmark-o"
                  }
                  size={20}
                  color={session ? Colors[theme ?? "light"].text : "#aaa"}
                />
              </TouchableOpacity>
            </View>

            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.postImage}
                contentFit="cover"
              />
            )}
            {item.content && (
              <MonoText
                style={[
                  styles.postContent,
                  { color: Colors[theme ?? "light"].text },
                ]}
              >
                {item.content}
              </MonoText>
            )}

            {/* Comment section */}
            <View style={styles.commentSection}>
              <TouchableOpacity
                style={styles.commentButton}
                onPress={() => toggleShowComments(item.id)}
              >
                <ChatBubbleLeftIcon
                  size={18}
                  color={Colors[theme ?? "light"].text}
                />
                <Text style={styles.commentButtonText}>
                  {item.comments && item.comments.length > 0
                    ? `${item.comments.length} Comment${
                        item.comments.length === 1 ? "" : "s"
                      }`
                    : "Comments"}
                </Text>
                {item.showComments ? (
                  <ChevronUpIcon
                    size={16}
                    color={Colors[theme ?? "light"].text}
                  />
                ) : (
                  <ChevronDownIcon
                    size={16}
                    color={Colors[theme ?? "light"].text}
                  />
                )}
              </TouchableOpacity>

              {item.showComments && (
                <View style={styles.commentsContainer}>
                  {/* Comments list */}
                  {item.comments && item.comments.length > 0 ? (
                    item.comments.map((comment) => (
                      <View
                        key={comment.id}
                        style={styles.commentItem}
                      >
                        <View style={styles.commentProfilePicContainer}>
                          <Image
                            source={
                              comment.user.profile_pic
                                ? { uri: comment.user.profile_pic }
                                : DEFAULT_PROFILE_PIC
                            }
                            style={styles.commentProfilePic}
                            contentFit="cover"
                          />
                        </View>
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUserName}>
                            {comment.user.fullname || comment.user.username}
                          </Text>
                          <MonoText style={styles.commentText}>
                            {comment.content}
                          </MonoText>
                          <Text style={styles.commentTime}>
                            {dayjs(comment.created_at).format(
                              "MMM D, YYYY [at] h:mm A"
                            )}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                  )}

                  {/* Add comment input */}
                  {session ? (
                    <View style={styles.addCommentContainer}>
                      <TextInput
                        style={[
                          styles.commentInput,
                          { color: Colors[theme ?? "light"].text },
                        ]}
                        placeholder="Add a comment..."
                        placeholderTextColor={Colors[theme ?? "light"].text}
                        value={commentText[item.id] || ""}
                        onChangeText={(text) =>
                          setCommentText({ ...commentText, [item.id]: text })
                        }
                        multiline
                      />
                      <TouchableOpacity
                        style={[
                          styles.addCommentButton,
                          { backgroundColor: Colors[theme ?? "light"].tint },
                        ]}
                        onPress={() => addComment(item.id)}
                        disabled={addingComment[item.id]}
                      >
                        {addingComment[item.id] ? (
                          <ActivityIndicator
                            size="small"
                            color="#fff"
                          />
                        ) : (
                          <Text
                            style={[
                              styles.addCommentButtonText,
                              { color: Colors[theme ?? "light"].background },
                            ]}
                          >
                            Post
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.loginPrompt}>
                      Please login to add comments
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchPosts}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MonoText>
              No posts yet.{" "}
              {session ? "Create the first one!" : "Login to create posts."}
            </MonoText>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBlockEnd: 30,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  postContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  profilePicContainer: {
    width: 40,
    height: 40,
    position: "relative",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loadingIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: "Poppins",
    fontSize: 14,
  },
  postTime: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: "Poppins",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  // Comment section styles
  commentSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentButtonText: {
    fontFamily: "Poppins",
    fontSize: 13,
    marginRight: 6,
  },
  commentsContainer: {
    marginTop: 12,
    gap: 12,
  },
  commentItem: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  commentProfilePicContainer: {
    width: 30,
    height: 30,
  },
  commentProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "600",
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
  },
  commentTime: {
    fontSize: 10,
    opacity: 0.6,
    fontFamily: "Poppins",
  },
  noCommentsText: {
    fontFamily: "Poppins",
    fontSize: 13,
    textAlign: "center",
    opacity: 0.7,
    padding: 8,
  },
  addCommentContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
    alignItems: "flex-end",
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 8,
    paddingTop: 8,
    fontFamily: "Poppins",
    fontSize: 13,
    maxHeight: 100,
  },
  addCommentButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    height: 40,
  },
  addCommentButtonText: {
    fontFamily: "Poppins",
    fontSize: 13,
  },
  loginPrompt: {
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 13,
    fontStyle: "italic",
    opacity: 0.7,
    padding: 8,
  },
});
