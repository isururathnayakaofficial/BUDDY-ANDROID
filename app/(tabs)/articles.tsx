import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getArticles } from '../api/newsAPI';
import { router } from 'expo-router';

const ORANGE = '#F47A21';

interface Article {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
}

export default function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getArticles();
      setArticles(data);
    } catch (error: any) {
      console.log('Articles fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    const onBackPress = () => { router.replace('/home'); return true; };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Article; index: number }) => (
      <Pressable
        style={[styles.card, index < articles.length - 1 && styles.cardBorder]}
        onPress={() => {
          if (item.url) Linking.openURL(item.url);
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.source}>{item.source?.name || 'Unknown'}</Text>
          <Text style={styles.date}>
            {item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString()
              : ''}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={3}>
          {item.title}
        </Text>

        {item.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        <Text style={styles.readMore}>Read more →</Text>
      </Pressable>
    ),
    [articles.length],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
          <Pressable onPress={() => router.replace('/home')} style={{ marginRight: 12 }}>
            <Text style={{ color: '#3F3732', fontSize: 22, fontWeight: '700' }}>←</Text>
          </Pressable>
        <View>
          <Text style={styles.greeting}>News Feed</Text>
          <Text style={styles.subheading}>
            Stay up to date with the latest articles.
          </Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={loadArticles}>
          <Text style={styles.refreshButtonText}>↻</Text>
        </Pressable>
      </View>

      <FlatList
        data={articles}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>LATEST NEWS</Text>
              <Text style={styles.heroTitle}>
                {articles.length} articles from top topics today.
              </Text>
            </View>
            <View style={styles.heroArt}>
              <View style={styles.artBubbleOne} />
              <View style={styles.artBubbleTwo} />
              <Text style={styles.heroHeart}>✦</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={ORANGE} />
              <Text style={styles.emptyText}>Loading articles...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📰</Text>
              <Text style={styles.emptyTitle}>No articles found</Text>
              <Text style={styles.emptySubtitle}>
                Pull down or tap refresh to try again.
              </Text>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
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
  refreshButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
  },
  refreshButtonText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },

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

  card: {
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
  cardBorder: { borderBottomWidth: 1, borderBottomColor: '#F1EBE7' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  source: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  date: { color: '#A69B94', fontSize: 11 },
  title: { color: '#292420', fontSize: 16, fontWeight: '800', lineHeight: 22 },
  description: { color: '#8A817B', fontSize: 13, lineHeight: 18, marginTop: 8 },
  readMore: { color: ORANGE, fontSize: 12, fontWeight: '800', marginTop: 10 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#3F3732', fontSize: 17, fontWeight: '800' },
  emptySubtitle: { color: '#8A817B', fontSize: 14, marginTop: 6 },
  emptyText: { color: '#8A817B', fontSize: 14, marginTop: 10 },
});
