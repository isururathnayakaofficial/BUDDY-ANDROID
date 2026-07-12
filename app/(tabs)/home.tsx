import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const ORANGE = "#F47A21";

interface Memory {
  id: string;
  title: string;
  description: string;
  emoji: string;
  completed: boolean;
  uid: string;
  createdAt: any;
}

interface Note {
  id: string;
  title: string;
  body: string;
  uid: string;
  createdAt: any;
  updatedAt: any;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [userName, setUserName] = useState("buddy");

  useEffect(() => {
    let unsubscribeMemories: (() => void) | null = null;
    let unsubscribeNotes: (() => void) | null = null;
    let currentUid: string | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const newUid = firebaseUser?.uid ?? null;
      if (newUid === currentUid) return;
      currentUid = newUid;

      if (unsubscribeMemories) { unsubscribeMemories(); unsubscribeMemories = null; }
      if (unsubscribeNotes) { unsubscribeNotes(); unsubscribeNotes = null; }

      if (!firebaseUser) {
        setMemories([]);
        setNotes([]);
        setLoadingMemories(false);
        setLoadingNotes(false);
        setUserName("buddy");
        return;
      }

      setUserName(firebaseUser.displayName || "friend");

      const memQuery = query(
        collection(db, "memories"),
        where("uid", "==", firebaseUser.uid),
      );
      unsubscribeMemories = onSnapshot(memQuery, (snap) => {
        const all: Memory[] = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Memory[];
        all.sort((a, b) => {
          const aT = a.createdAt?.seconds ?? 0;
          const bT = b.createdAt?.seconds ?? 0;
          return aT - bT;
        });
        setMemories(all.slice(0, 2));
        setLoadingMemories(false);
      }, () => setLoadingMemories(false));

      const noteQuery = query(
        collection(db, "notes"),
        where("uid", "==", firebaseUser.uid),
      );
      unsubscribeNotes = onSnapshot(noteQuery, (snap) => {
        const all: Note[] = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Note[];
        all.sort((a, b) => {
          const aT = a.updatedAt?.seconds ?? a.createdAt?.seconds ?? 0;
          const bT = b.updatedAt?.seconds ?? b.createdAt?.seconds ?? 0;
          return bT - aT;
        });
        setNotes(all.slice(0, 3));
        setLoadingNotes(false);
      }, () => setLoadingNotes(false));
    });

    return () => {
      if (unsubscribeMemories) unsubscribeMemories();
      if (unsubscribeNotes) unsubscribeNotes();
      unsubscribeAuth();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {userName}</Text>
            <Text style={styles.subheading}>Here is your little corner of Buddy.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>YOUR BUDDY CIRCLE</Text>
            <Text style={styles.heroTitle}>
              {memories.length + notes.length} items saved across memories and notes.
            </Text>
            <Pressable style={styles.heroButton} onPress={() => router.push('/memories')}>
              <Text style={styles.heroButtonText}>See your circle</Text>
            </Pressable>
          </View>
          <View style={styles.heroArt}>
            <View style={styles.artBubbleOne} />
            <View style={styles.artBubbleTwo} />
            <Text style={styles.heroHeart}>♥</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionGrid}>
          <ActionButton emoji="✦" label="Add memory" color="#FFF0E5" onPress={() => router.push('/memories')} />
          <ActionButton emoji="☺" label="Watch articles" color="#E7F7EF" onPress={() => router.push('/articles')} />
          <ActionButton emoji="✎" label="Notes" color="#EEF3FF" onPress={() => router.push('/notes')} />
          <ActionButton emoji="✦" label="Ask me" color="#FFF0E5" onPress={() => router.push('/askme')} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coming up</Text>
          <Pressable onPress={() => router.push('/memories')}>
            <Text style={styles.textButton}>View all</Text>
          </Pressable>
        </View>
        <View style={styles.listCard}>
          {loadingMemories ? (
            <View style={styles.emptyRow}>
              <ActivityIndicator size="small" color={ORANGE} />
            </View>
          ) : memories.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No memories yet. Tap + to add one.</Text>
            </View>
          ) : (
            memories.map((memory, index) => (
              <Pressable
                key={memory.id}
                style={[styles.listRow, index < memories.length - 1 && styles.rowBorder]}
                onPress={() => router.push('/memories')}
              >
                <View style={[styles.itemIcon, { backgroundColor: memory.completed ? "#DFF4EA" : "#FFE1CC" }]}>
                  <Text style={styles.itemEmoji}>{memory.emoji || "✦"}</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{memory.title}</Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>{memory.description || "No description"}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable onPress={() => router.push('/notes')}>
            <Text style={styles.textButton}>View all</Text>
          </Pressable>
        </View>
        <View style={styles.listCard}>
          {loadingNotes ? (
            <View style={styles.emptyRow}>
              <ActivityIndicator size="small" color={ORANGE} />
            </View>
          ) : notes.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No notes yet. Tap + to create one.</Text>
            </View>
          ) : (
            notes.map((note, index) => (
              <Pressable
                key={note.id}
                style={[styles.listRow, index < notes.length - 1 && styles.rowBorder]}
                onPress={() => router.push('/notes')}
              >
                <View style={[styles.itemIcon, { backgroundColor: "#EEF3FF" }]}>
                  <Text style={styles.itemEmoji}>✎</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{note.title || "Untitled"}</Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>{note.body || "No content"}</Text>
                </View>
                <Text style={styles.activityTime}>
                  {note.updatedAt?.seconds
                    ? timeAgo(note.updatedAt.seconds)
                    : note.createdAt?.seconds
                      ? timeAgo(note.createdAt.seconds)
                      : "Just now"}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function timeAgo(seconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ActionButton({
  emoji,
  label,
  color,
  onPress,
}: {
  emoji: string;
  label: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F5" },
  content: { padding: 20, paddingBottom: 38 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  greeting: { color: "#292420", fontSize: 25, fontWeight: "800", letterSpacing: -0.5 },
  subheading: { color: "#807772", fontSize: 14, marginTop: 5 },
  avatar: {
    width: 45, height: 45, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
    backgroundColor: ORANGE,
  },
  avatarText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  heroCard: {
    flexDirection: "row", overflow: "hidden", minHeight: 178,
    borderRadius: 25, backgroundColor: ORANGE, padding: 22, marginTop: 26,
  },
  heroCopy: { flex: 1, zIndex: 1 },
  heroEyebrow: { color: "#FFE1CA", fontWeight: "800", fontSize: 10, letterSpacing: 1 },
  heroTitle: { color: "#FFFFFF", fontWeight: "800", fontSize: 21, lineHeight: 27, marginTop: 10, maxWidth: 210 },
  heroButton: {
    alignSelf: "flex-start", marginTop: 16,
    paddingHorizontal: 13, paddingVertical: 9,
    backgroundColor: "#FFFFFF", borderRadius: 11,
  },
  heroButtonText: { color: ORANGE, fontSize: 12, fontWeight: "800" },
  heroArt: {
    position: "absolute", right: -12, bottom: -27,
    width: 146, height: 146, borderRadius: 73,
    backgroundColor: "#FF9B56", alignItems: "center", justifyContent: "center",
  },
  heroHeart: { color: "#FFFFFF", fontSize: 54, marginTop: -5 },
  artBubbleOne: {
    position: "absolute", top: 11, left: 4,
    width: 25, height: 25, borderRadius: 13, backgroundColor: "#FFD4B5",
  },
  artBubbleTwo: {
    position: "absolute", bottom: 19, left: -13,
    width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFB579",
  },
  sectionTitle: { color: "#352E2A", fontSize: 18, fontWeight: "800" },
  actionGrid: { flexDirection: "row", gap: 10, marginTop: 13, marginBottom: 28 },
  actionButton: {
    flex: 1, minHeight: 102, borderRadius: 18, padding: 13, justifyContent: "space-between",
  },
  actionEmoji: { color: ORANGE, fontSize: 23, fontWeight: "800" },
  actionLabel: { color: "#4B413B", fontSize: 13, fontWeight: "800", lineHeight: 17 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
  },
  textButton: { color: ORANGE, fontSize: 13, fontWeight: "800" },
  listCard: {
    backgroundColor: "#FFFFFF", borderRadius: 19, paddingHorizontal: 16, marginBottom: 27,
    shadowColor: "#765E50", shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  listRow: { minHeight: 71, flexDirection: "row", alignItems: "center" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1EBE7" },
  itemIcon: {
    width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  itemEmoji: { fontSize: 20 },
  rowContent: { flex: 1, marginLeft: 12 },
  rowTitle: { color: "#3F3732", fontSize: 14, fontWeight: "800" },
  rowSubtitle: { color: "#8A817B", fontSize: 12, marginTop: 4 },
  chevron: { color: "#C0B4AD", fontSize: 28, lineHeight: 30 },
  emptyRow: { minHeight: 71, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#A69B94", fontSize: 13 },
  activityTime: {
    color: "#A69B94", fontSize: 10, alignSelf: "flex-start", marginTop: 19,
  },
});
