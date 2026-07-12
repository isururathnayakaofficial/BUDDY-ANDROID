import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const ORANGE = '#F47A21';

interface Memory {
  id: string;
  title: string;
  description: string;
  emoji: string;
  completed: boolean;
  uid: string;
  createdAt: any;
}

interface Pokemon {
  name: string;
  id: number;
  sprite: string;
  types: string;
}

const EMOJI_OPTIONS = ['☀', '☕', '📞', '✦', '♡', '✎', '◎', '✿', '♫', '⚑'];

export default function MemoriesScreen() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('☀');

  const [tab, setTab] = useState<'memories' | 'pokemon'>('memories');

  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [pokemonLoading, setPokemonLoading] = useState(true);

  const fetchPokemon = useCallback(async () => {
    try {
      setPokemonLoading(true);
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
      const data = await res.json();
      const details = await Promise.all(
        data.results.map(async (p: { name: string; url: string }) => {
          const r = await fetch(p.url);
          const d = await r.json();
          return {
            name: d.name,
            id: d.id,
            sprite: d.sprites.front_default,
            types: d.types.map((t: any) => t.type.name).join(', '),
          };
        }),
      );
      setPokemon(details);
    } catch (error: any) {
      console.log('Pokemon fetch error:', error.message);
    } finally {
      setPokemonLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

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
        setMemories([]);
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, 'memories'),
        where('uid', '==', firebaseUser.uid),
      );
      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const items: Memory[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Memory[];
          items.sort((a, b) => {
            const aTime = a.createdAt?.seconds ?? 0;
            const bTime = b.createdAt?.seconds ?? 0;
            return bTime - aTime;
          });
          setMemories(items);
          setLoading(false);
        },
        (error) => {
          console.log('Firestore listener error:', error);
          setLoading(false);
        },
      );
    });
    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      unsubscribeAuth();
    };
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setSelectedEmoji('☀');
    setEditingMemory(null);
  }, []);

  const openAddModal = useCallback(() => {
    resetForm();
    setModalVisible(true);
  }, [resetForm]);

  const openEditModal = useCallback((memory: Memory) => {
    setEditingMemory(memory);
    setTitle(memory.title);
    setDescription(memory.description);
    setSelectedEmoji(memory.emoji);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a title for your memory.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      emoji: selectedEmoji,
    };

    try {
      if (editingMemory) {
        await updateDoc(doc(db, 'memories', editingMemory.id), {
          ...payload,
        });
      } else {
        const docRef = await addDoc(collection(db, 'memories'), {
          ...payload,
          completed: false,
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
        console.log('Memory saved with id:', docRef.id, 'uid:', user.uid);
      }
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
      console.log('Firestore save error:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Check Firestore rules.');
    }
  }, [title, description, selectedEmoji, editingMemory, resetForm, user]);

  const handleDelete = useCallback((memory: Memory) => {
    const doDelete = async () => {
      try {
        await deleteDoc(doc(db, 'memories', memory.id));
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to delete.');
      }
    };
    if (Platform.OS === 'web') {
      doDelete();
    } else {
      Alert.alert(
        'Delete memory',
        `Are you sure you want to delete "${memory.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => doDelete() },
        ],
      );
    }
  }, []);

  const handleToggleComplete = useCallback(async (memory: Memory) => {
    try {
      await updateDoc(doc(db, 'memories', memory.id), {
        completed: !memory.completed,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update.');
    }
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Memory; index: number }) => (
      <View
        style={[styles.listRow, index < memories.length - 1 && styles.rowBorder]}
      >
        <Pressable
          onPress={() => handleToggleComplete(item)}
          style={[
            styles.toggleButton,
            item.completed ? styles.toggleCompleted : styles.togglePending,
          ]}
        >
          <Text style={styles.toggleCheck}>
            {item.completed ? '✓' : ''}
          </Text>
        </Pressable>

        <Pressable
          style={styles.rowContent}
          onPress={() => openEditModal(item)}
        >
          <Text
            style={[
              styles.rowTitle,
              item.completed && styles.completedStrikethrough,
            ]}
          >
            {item.title}
          </Text>

          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {item.description || ''}
          </Text>

          <Text
            style={item.completed ? styles.statusDone : styles.statusPending}
          >
            {item.completed ? 'Completed' : 'Uncompleted'}
          </Text>
        </Pressable>
        

        <Pressable
          onPress={() => handleDelete(item)}
          hitSlop={12}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Del</Text>
        </Pressable>
      </View>
    ),
    [memories.length, handleToggleComplete, openEditModal, handleDelete],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>My Memories</Text>
            <Text style={styles.subheading}>
              Your personal collection of moments.
            </Text>
          </View>
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabButton, tab === 'memories' && styles.tabActive]}
            onPress={() => setTab('memories')}
          >
            <Text style={[styles.tabText, tab === 'memories' && styles.tabTextActive]}>
              Memories
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, tab === 'pokemon' && styles.tabActive]}
            onPress={() => setTab('pokemon')}
          >
            <Text style={[styles.tabText, tab === 'pokemon' && styles.tabTextActive]}>
              Pokémon
            </Text>
          </Pressable>
        </View>

        {tab === 'memories' ? (
          <FlatList
            data={memories}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <View style={styles.heroCard}>
                  <View style={styles.heroCopy}>
                    <Text style={styles.heroEyebrow}>YOUR MEMORIES</Text>
                    <Text style={styles.heroTitle}>
                      {memories.filter((m) => m.completed).length} of {memories.length}{' '}
                      memories saved.
                    </Text>
                  </View>
                  <View style={styles.heroArt}>
                    <View style={styles.artBubbleOne} />
                    <View style={styles.artBubbleTwo} />
                    <Text style={styles.heroHeart}>✦</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>All memories</Text>
              </>
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="large" color={ORANGE} />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>☐</Text>
                  <Text style={styles.emptyTitle}>No memories yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Tap the + button to add your first memory.
                  </Text>
                </View>
              )
            }
            ListFooterComponent={<View style={{ height: 40 }} />}
          />
        ) : (
          <FlatList
            data={pokemon}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.pokemonRow}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>Pokédex</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.pokemonCard}>
                <View style={styles.pokemonSpriteWrap}>
                  {item.sprite ? (
                    <Text style={styles.pokemonEmoji}>🎮</Text>
                  ) : null}
                  <Text style={styles.pokemonName}>{item.name}</Text>
                </View>
                <Text style={styles.pokemonId}>#{item.id}</Text>
                <Text style={styles.pokemonType}>{item.types}</Text>
              </View>
            )}
            ListEmptyComponent={
              pokemonLoading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="large" color={ORANGE} />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No Pokémon loaded</Text>
                </View>
              )
            }
            ListFooterComponent={<View style={{ height: 40 }} />}
          />
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setModalVisible(false);
            resetForm();
          }}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              setModalVisible(false);
              resetForm();
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <Pressable style={styles.modalContent} onPress={() => {}}>
                <Text style={styles.modalTitle}>
                  {editingMemory ? 'Edit Memory' : 'New Memory'}
                </Text>

                <Text style={styles.fieldLabel}>Emoji</Text>
                <View style={styles.emojiRow}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      style={[
                        styles.emojiOption,
                        selectedEmoji === emoji && styles.emojiSelected,
                      ]}
                      onPress={() => setSelectedEmoji(emoji)}
                    >
                      <Text style={styles.emojiOptionText}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What's this memory about?"
                  placeholderTextColor="#B8ADA6"
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.fieldLabel}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Add details..."
                  placeholderTextColor="#B8ADA6"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />

                <Pressable style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>
                    {editingMemory ? 'Update' : 'Add Memory'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </Pressable>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
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

  sectionTitle: { color: '#352E2A', fontSize: 18, fontWeight: '800', marginTop: 6, marginBottom: 13 },

  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    paddingHorizontal: 16,
    marginBottom: 27,
    shadowColor: '#765E50',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  listRow: { minHeight: 80, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1EBE7' },
  itemEmoji: { fontSize: 20 },
  completedText: { opacity: 0.4 },
  toggleButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePending: {
    borderColor: '#C0B4AD',
    backgroundColor: '#FFFFFF',
  },
  toggleCompleted: {
    borderColor: ORANGE,
    backgroundColor: ORANGE,
  },
  toggleCheck: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  rowContent: { flex: 1, marginLeft: 12 },
  rowTitle: { color: '#3F3732', fontSize: 14, fontWeight: '800' },
  completedStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#B8ADA6',
  },
  rowSubtitle: { color: '#8A817B', fontSize: 12, marginTop: 4 },
  statusDone: { color: ORANGE, fontSize: 11, fontWeight: '700', marginTop: 4 },
  statusPending: { color: '#C0B4AD', fontSize: 11, fontWeight: '700', marginTop: 4 },

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
  },
  modalTitle: {
    color: '#292420',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
  },
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
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },

  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1EBE7',
  },
  emojiSelected: {
    borderColor: ORANGE,
    backgroundColor: '#FFF0E5',
  },
  emojiOptionText: { fontSize: 18 },

  saveButton: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  cancelButton: { alignItems: 'center', marginTop: 12 },
  cancelButtonText: { color: '#8A817B', fontSize: 14, fontWeight: '700' },
});


