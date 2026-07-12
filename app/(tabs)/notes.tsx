import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { router } from 'expo-router';

const ORANGE = '#F47A21';

interface Note {
  id: string;
  title: string;
  body: string;
  uid: string;
  createdAt: any;
  updatedAt: any;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    let currentUid: string | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const newUid = firebaseUser?.uid ?? null;
      if (newUid === currentUid) return;
      currentUid = newUid;

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      setUser(firebaseUser);
      if (!firebaseUser) {
        setNotes([]);
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, 'notes'),
        where('uid', '==', firebaseUser.uid),
      );
      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const items: Note[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Note[];
          items.sort((a, b) => {
            const aTime = a.updatedAt?.seconds ?? a.createdAt?.seconds ?? 0;
            const bTime = b.updatedAt?.seconds ?? b.createdAt?.seconds ?? 0;
            return bTime - aTime;
          });
          setNotes(items);
          setLoading(false);
        },
        (error) => {
          console.log('Notes listener error:', error);
          setLoading(false);
        },
      );
    });
    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    const onBackPress = () => { router.replace('/home'); return true; };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const autoSave = useCallback(
    (noteId: string, newTitle: string, newBody: string) => {
      setSaving(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'notes', noteId), {
            title: newTitle.trim(),
            body: newBody.trim(),
            updatedAt: serverTimestamp(),
          });
        } catch (error: any) {
          console.log('Auto-save error:', error.message);
        } finally {
          setSaving(false);
        }
      }, 800);
    },
    [],
  );

  const handleTitleChange = useCallback(
    (text: string) => {
      setTitle(text);
      if (editingNote) {
        autoSave(editingNote.id, text, body);
      }
    },
    [editingNote, body, autoSave],
  );

  const handleBodyChange = useCallback(
    (text: string) => {
      setBody(text);
      if (editingNote) {
        autoSave(editingNote.id, title, text);
      }
    },
    [editingNote, title, autoSave],
  );

  const getUntitledName = useCallback((): string => {
    const existingTitles = notes.map((n) => n.title);
    if (!existingTitles.includes('Untitled')) return 'Untitled';
    let i = 1;
    while (existingTitles.includes(`Untitled ${i}`)) i++;
    return `Untitled ${i}`;
  }, [notes]);

  const handleCreate = useCallback(async () => {
    if (!user) return;
    const noteTitle = getUntitledName();
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        title: noteTitle,
        body: '',
        uid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const newNote: Note = {
        id: docRef.id,
        title: noteTitle,
        body: '',
        uid: user.uid,
        createdAt: null,
        updatedAt: null,
      };
      setEditingNote(newNote);
      setTitle(noteTitle);
      setBody('');
      setModalVisible(true);
    } catch (error: any) {
      console.log('Create note error:', error.message);
    }
  }, [user, getUntitledName]);

  const handleDelete = useCallback((note: Note) => {
    const doDelete = async () => {
      try {
        await deleteDoc(doc(db, 'notes', note.id));
      } catch (error: any) {
        console.log('Delete note error:', error.message);
      }
    };
    if (Platform.OS === 'web') {
      doDelete();
    } else {
      Alert.alert('Delete note', `Delete "${note.title || 'Untitled'}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => doDelete() },
      ]);
    }
  }, []);

  const openNote = useCallback((note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setBody(note.body);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setEditingNote(null);
    setTitle('');
    setBody('');
    setModalVisible(false);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Note; index: number }) => (
      <Pressable
        style={[styles.noteCard, index < notes.length - 1 && styles.noteBorder]}
        onPress={() => openNote(item)}
      >
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.title || 'Untitled'}
          </Text>
          <Pressable
            onPress={() => handleDelete(item)}
            hitSlop={12}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>Del</Text>
          </Pressable>
        </View>
        <Text style={styles.noteBody} numberOfLines={2}>
          {item.body || 'No content'}
        </Text>
        <Text style={styles.noteTime}>
          {item.updatedAt?.seconds
            ? new Date(item.updatedAt.seconds * 1000).toLocaleString()
            : item.createdAt?.seconds
              ? new Date(item.createdAt.seconds * 1000).toLocaleString()
              : 'Just now'}
        </Text>
      </Pressable>
    ),
    [notes.length, openNote, handleDelete],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/home')} style={{ marginRight: 12 }}>
          <Text style={{ color: '#3F3732', fontSize: 22, fontWeight: '700' }}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.greeting}>My Notes</Text>
          <Text style={styles.subheading}>
            Quick notes that auto-save as you type.
          </Text>
        </View>
        <Pressable style={styles.addButton} onPress={handleCreate}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>AUTO-SAVE</Text>
              <Text style={styles.heroTitle}>
                {notes.length} notes saved. Start typing — it saves automatically.
              </Text>
            </View>
            <View style={styles.heroArt}>
              <View style={styles.artBubbleOne} />
              <View style={styles.artBubbleTwo} />
              <Text style={styles.heroHeart}>✎</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={ORANGE} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✎</Text>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button to create your first note.
              </Text>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Note</Text>
                {saving ? (
                  <View style={styles.savingBadge}>
                    <ActivityIndicator size="small" color={ORANGE} />
                    <Text style={styles.savingText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.savedBadge}>Saved</Text>
                )}
              </View>

              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Note title..."
                placeholderTextColor="#B8ADA6"
                value={title}
                onChangeText={handleTitleChange}
              />

              <Text style={styles.fieldLabel}>Content</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Start writing..."
                placeholderTextColor="#B8ADA6"
                value={body}
                onChangeText={handleBodyChange}
                multiline
                textAlignVertical="top"
              />

              <Pressable style={styles.doneButton} onPress={closeModal}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9F5' },
  content: { padding: 20, paddingBottom: 38 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  greeting: { color: '#292420', fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
  subheading: { color: '#807772', fontSize: 14, marginTop: 5 },
  addButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: -1 },

  heroCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 140,
    borderRadius: 25,
    backgroundColor: ORANGE,
    padding: 22,
    marginTop: 26,
  },
  heroCopy: { flex: 1, zIndex: 1 },
  heroEyebrow: { color: '#FFE1CA', fontWeight: '800', fontSize: 10, letterSpacing: 1 },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 27,
    marginTop: 10,
    maxWidth: 220,
  },
  heroArt: {
    position: 'absolute',
    right: -12,
    bottom: -27,
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: '#FF9B56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeart: { color: '#FFFFFF', fontSize: 48, marginTop: -5 },
  artBubbleOne: {
    position: 'absolute',
    top: 11,
    left: 4,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#FFD4B5',
  },
  artBubbleTwo: {
    position: 'absolute',
    bottom: 19,
    left: -13,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFB579',
  },

  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#765E50',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  noteBorder: { borderBottomWidth: 1, borderBottomColor: '#F1EBE7' },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTitle: { color: '#292420', fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
  noteBody: { color: '#8A817B', fontSize: 13, lineHeight: 18, marginTop: 6 },
  noteTime: { color: '#C0B4AD', fontSize: 11, marginTop: 8 },

  deleteButton: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0EC',
  },
  deleteButtonText: { color: '#E05D44', fontSize: 11, fontWeight: '800' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#3F3732', fontSize: 17, fontWeight: '800' },
  emptySubtitle: { color: '#8A817B', fontSize: 14, marginTop: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF9F5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: { color: '#292420', fontSize: 20, fontWeight: '800' },
  savingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savingText: { color: '#A69B94', fontSize: 12 },
  savedBadge: { color: '#82CBB2', fontSize: 12, fontWeight: '700' },

  fieldLabel: {
    color: '#807772',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1EBE7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#292420',
  },
  inputMultiline: { minHeight: 180, textAlignVertical: 'top' },

  doneButton: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  doneButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
