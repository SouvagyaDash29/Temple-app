// src/screens/explore/CommunityScreen.js
// Phase 1 scaffold for "Family / Sharing -> full social network". This is
// intentionally minimal: list + search + join/leave + create. A real feed,
// posts, comments, and group-scoped events are future work — see the model
// sketched in services/communityApi.js.
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { Search, Users, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import Fab from '../../components/Fab';
import EmptyState from '../../components/EmptyState';
import { useCommunities } from '../../hooks/useCommunities';

export default function CommunityScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { groups, loading, error, search, joinGroup, leaveGroup } = useCommunities();
  const [query, setQuery] = useState('');

  const handleSearch = (text) => {
    setQuery(text);
    search(text);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="h2">Communities</AppText>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.color.textSecondary} />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search communities"
            placeholderTextColor={theme.color.textDisabled}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <GroupRow
            group={item}
            theme={theme}
            onJoin={() => joinGroup(item.id)}
            onLeave={() => leaveGroup(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No communities yet"
              description="Be the first to create one for your temple or tradition."
              actionLabel="Create Group"
              onAction={() => navigation.navigate('CreateGroup')}
            />
          ) : null
        }
      />

      {error ? (
        <AppText variant="bodySmall" color="error" style={{ textAlign: 'center', marginBottom: theme.spacing.md }}>
          {error}
        </AppText>
      ) : null}

      <Fab onPress={() => navigation.navigate('CreateGroup')} />
    </Screen>
  );
}

function GroupRow({ group, theme, onJoin, onLeave }) {
  const styles = getStyles(theme);
  return (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Users size={20} color={theme.color.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText variant="h3" numberOfLines={1} style={{ flex: 1 }}>
              {group.name}
            </AppText>
            {group.isPrivate ? <Lock size={14} color={theme.color.textSecondary} /> : null}
          </View>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {group.memberCount || 0} members
          </AppText>
        </View>
        <Button
          label={group.isMember ? 'Leave' : 'Join'}
          variant={group.isMember ? 'secondary' : 'primary'}
          fullWidth={false}
          onPress={group.isMember ? onLeave : onJoin}
          style={{ paddingHorizontal: theme.spacing.lg, height: 36 }}
        />
      </View>
    </Card>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    header: { padding: theme.spacing.base },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.color.surface,
      borderWidth: 1,
      borderColor: theme.color.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.base,
      height: theme.inputHeight.default,
      marginTop: theme.spacing.md,
    },
    searchInput: { flex: 1, marginLeft: theme.spacing.sm, color: theme.color.text, fontSize: 16 },
    listContent: { paddingHorizontal: theme.spacing.base, paddingBottom: theme.spacing.huge },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.color.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
  });
