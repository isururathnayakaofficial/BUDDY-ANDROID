import React, { useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const ORANGE = "#F47A21";
const API_URL = "https://mern-new-be.onrender.com/api/ai/chat";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
}

export default function AskMeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.data || data.reply || data.response || data.message || "Sorry, I couldn't understand that.",
        sender: "ai",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Oops! Something went wrong. Please try again.",
        sender: "ai",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const renderItem = ({ item }: { item: Message }) => {
    if (item.sender === "user") {
      return (
        <View style={styles.userRow}>
          <View style={styles.userBubble}>
            <Text style={[styles.bubbleText, styles.userBubbleText]}>
              {item.text}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.aiRow}>
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>B</Text>
        </View>
        <View style={styles.aiBubble}>
          <Text style={styles.aiName}>Buddy</Text>
          <Text style={[styles.bubbleText, styles.aiBubbleText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ask Buddy</Text>
          <Text style={styles.headerSub}>Your personal AI assistant</Text>
        </View>

        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✦</Text>
            <Text style={styles.emptyTitle}>Ask me anything!</Text>
            <Text style={styles.emptyDesc}>
              I can help with questions, ideas, or just have a chat.
            </Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {loading && (
          <View style={styles.aiRow}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>B</Text>
            </View>
            <View style={[styles.aiBubble, styles.loadingBubble]}>
              <Text style={styles.aiName}>Buddy</Text>
              <ActivityIndicator size="small" color={ORANGE} />
            </View>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me anything..."
            placeholderTextColor="#B0A6A0"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!input.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F5" },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "#FFF9F5",
    borderBottomWidth: 1,
    borderBottomColor: "#F1EBE7",
  },
  headerTitle: { color: "#292420", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#807772", fontSize: 13, marginTop: 2 },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  userRow: { flexDirection: "row", justifyContent: "flex-end" },
  aiRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 2,
  },
  aiAvatarText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  aiName: { color: ORANGE, fontSize: 11, fontWeight: "800", marginBottom: 4 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: ORANGE,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "80%",
  },
  aiBubble: {
    flexShrink: 1,
    maxWidth: "75%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#765E50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  userBubbleText: { color: "#FFFFFF" },
  aiBubbleText: { color: "#3F3732" },
  loadingBubble: { paddingHorizontal: 20, paddingVertical: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1EBE7",
    backgroundColor: "#FFF9F5",
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: "#3F3732",
    borderWidth: 1,
    borderColor: "#F1EBE7",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendIcon: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyEmoji: { fontSize: 42, color: ORANGE },
  emptyTitle: {
    color: "#292420",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 14,
  },
  emptyDesc: {
    color: "#807772",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
