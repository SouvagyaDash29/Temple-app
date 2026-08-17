// src/screens/explore/CommunityScreen.js
// Community list with server-style pagination (infinite scroll + pull to
// refresh + page indicator). List + search + join/leave + create.
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, Users, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import Fab from '../../components/Fab';
import EmptyState from '../../components/EmptyState';
import { useCommunities } from '../../hooks/useCommunities';

export default function CommunityScreen({ navigation }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const { groups, loading, loadingMore, refreshing, error, page, total, hasMore, search, loadMore, refresh, joinGroup, leaveGroup } = useCommunities();
  const [query, setQuery] = useState('');

  const handleSearch = (text) => {
    setQuery(text);
    search(text);
  };

  const handleEndReached = () => {
    if (hasMore) loadMore(query);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="h2">{t('communities')}</AppText>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.color.textSecondary} />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder={t('search')}
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
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.color.primary} />
            </View>
          ) : groups.length > 0 ? (
            <View style={styles.footer}>
              <AppText variant="caption" color="textSecondary">
                {t('pageOf', { page, total: Math.ceil(total / 10) || 1 })}
              </AppText>
              {!hasMore ? (
                <AppText variant="caption" color="textSecondary">
                  {t('endOfList')}
                </AppText>
              ) : null}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title={t('communitiesEmptyTitle')}
              description={t('communitiesEmptyDescription')}
              actionLabel={t('createGroup')}
              onAction={() => navigation.navigate('CreateGroup')}
            />
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => refresh(query)} tintColor={theme.color.primary} />
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
  const { t } = useTranslation();
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
            {t('membersCount', { count: group.memberCount || 0 })}
          </AppText>
        </View>
        <Button
          label={group.isMember ? t('leaveGroup') : t('joinGroup')}
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
    footer: { alignItems: 'center', paddingVertical: theme.spacing.lg },
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
