import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const upcomingMoments = [
  { title: 'Coffee with Maya', time: 'Today · 4:30 PM', color: '#FFE1CC', emoji: '☕' },
  { title: 'Call with Sam', time: 'Tomorrow · 10:00 AM', color: '#DFF4EA', emoji: '☎' },
];

const recentActivity = [
  { name: 'Maya', message: 'Shared a new photo with you', time: '12 min ago', color: '#FFB36B' },
  { name: 'Sam', message: 'Sent you a little encouragement', time: 'Yesterday', color: '#82CBB2' },
  { name: 'Jordan', message: 'Added a memory to your circle', time: 'Yesterday', color: '#92B9F5' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, Alex</Text>
            <Text style={styles.subheading}>Here is your little corner of Buddy.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>YOUR BUDDY CIRCLE</Text>
            <Text style={styles.heroTitle}>3 people are cheering you on today.</Text>
            <Pressable style={styles.heroButton} onPress={() => {}}>
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
          <ActionButton emoji="✦" label="Add memory" color="#FFF0E5" />
          <ActionButton emoji="☺" label="Send a note" color="#E7F7EF" />
          <ActionButton emoji="+" label="Invite buddy" color="#EEF3FF" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coming up</Text>
          <Pressable onPress={() => {}}><Text style={styles.textButton}>View all</Text></Pressable>
        </View>
        <View style={styles.listCard}>
          {upcomingMoments.map((moment, index) => (
            <View key={moment.title} style={[styles.listRow, index === 0 && styles.rowBorder]}>
              <View style={[styles.itemIcon, { backgroundColor: moment.color }]}>
                <Text style={styles.itemEmoji}>{moment.emoji}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{moment.title}</Text>
                <Text style={styles.rowSubtitle}>{moment.time}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable onPress={() => {}}><Text style={styles.textButton}>View all</Text></Pressable>
        </View>
        <View style={styles.listCard}>
          {recentActivity.map((activity, index) => (
            <View key={activity.name} style={[styles.listRow, index < recentActivity.length - 1 && styles.rowBorder]}>
              <View style={[styles.avatar, styles.smallAvatar, { backgroundColor: activity.color }]}>
                <Text style={styles.smallAvatarText}>{activity.name[0]}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{activity.name}</Text>
                <Text style={styles.rowSubtitle}>{activity.message}</Text>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <Pressable style={[styles.actionButton, { backgroundColor: color }]} onPress={() => {}}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const ORANGE = '#F47A21';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9F5' },
  content: { padding: 20, paddingBottom: 38 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  greeting: { color: '#292420', fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
  subheading: { color: '#807772', fontSize: 14, marginTop: 5 },
  avatar: { width: 45, height: 45, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: ORANGE },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  heroCard: { flexDirection: 'row', overflow: 'hidden', minHeight: 178, borderRadius: 25, backgroundColor: ORANGE, padding: 22, marginTop: 26 },
  heroCopy: { flex: 1, zIndex: 1 },
  heroEyebrow: { color: '#FFE1CA', fontWeight: '800', fontSize: 10, letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 21, lineHeight: 27, marginTop: 10, maxWidth: 210 },
  heroButton: { alignSelf: 'flex-start', marginTop: 16, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#FFFFFF', borderRadius: 11 },
  heroButtonText: { color: ORANGE, fontSize: 12, fontWeight: '800' },
  heroArt: { position: 'absolute', right: -12, bottom: -27, width: 146, height: 146, borderRadius: 73, backgroundColor: '#FF9B56', alignItems: 'center', justifyContent: 'center' },
  heroHeart: { color: '#FFFFFF', fontSize: 54, marginTop: -5 },
  artBubbleOne: { position: 'absolute', top: 11, left: 4, width: 25, height: 25, borderRadius: 13, backgroundColor: '#FFD4B5' },
  artBubbleTwo: { position: 'absolute', bottom: 19, left: -13, width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFB579' },
  sectionTitle: { color: '#352E2A', fontSize: 18, fontWeight: '800' },
  actionGrid: { flexDirection: 'row', gap: 10, marginTop: 13, marginBottom: 28 },
  actionButton: { flex: 1, minHeight: 102, borderRadius: 18, padding: 13, justifyContent: 'space-between' },
  actionEmoji: { color: ORANGE, fontSize: 23, fontWeight: '800' },
  actionLabel: { color: '#4B413B', fontSize: 13, fontWeight: '800', lineHeight: 17 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  textButton: { color: ORANGE, fontSize: 13, fontWeight: '800' },
  listCard: { backgroundColor: '#FFFFFF', borderRadius: 19, paddingHorizontal: 16, marginBottom: 27, shadowColor: '#765E50', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  listRow: { minHeight: 71, flexDirection: 'row', alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1EBE7' },
  itemIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemEmoji: { fontSize: 20 },
  rowContent: { flex: 1, marginLeft: 12 },
  rowTitle: { color: '#3F3732', fontSize: 14, fontWeight: '800' },
  rowSubtitle: { color: '#8A817B', fontSize: 12, marginTop: 4 },
  chevron: { color: '#C0B4AD', fontSize: 28, lineHeight: 30 },
  smallAvatar: { width: 37, height: 37, borderRadius: 19 },
  smallAvatarText: { color: '#FFFFFF', fontWeight: '800' },
  activityTime: { color: '#A69B94', fontSize: 10, alignSelf: 'flex-start', marginTop: 19 },
});
