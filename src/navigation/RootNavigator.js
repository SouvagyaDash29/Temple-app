// src/navigation/RootNavigator.js
import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  CalendarDays,
  Compass,
  User,
  Settings,
  KeyRound,
  LogOut,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  CalendarCheck,
  Unlink,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import { useTranslation } from '../i18n';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import CalendarScreen from '../screens/CalendarScreen';
import AddEventScreen from '../screens/AddEventScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FestivalDetailScreen from '../screens/FestivalDetailScreen';
import SetPinScreen from '../screens/auth/SetPinScreen';
import ExploreHomeScreen from '../screens/explore/ExploreHomeScreen';
import AllEventsScreen from '../screens/explore/AllEventsScreen';
import CommunityScreen from '../screens/explore/CommunityScreen';
import CreateGroupScreen from '../screens/explore/CreateGroupScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Placeholder({ label, theme }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl }}>
      <AppText variant="h3" color="textSecondary" style={{ textAlign: 'center' }}>
        {label}
      </AppText>
    </View>
  );
}

// ---- Profile / "Me" ----

function initialsFor(text) {
  if (!text) return 'D';
  return String(text).trim().charAt(0).toUpperCase();
}

function MeScreen({ navigation }) {
  const theme = useTheme();
  const styles = getMeStyles(theme);
  const { t } = useTranslation();
  const { session, logout } = useAuthContext();

  return (
    <Screen style={{ backgroundColor: theme.color.background }}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing.huge + 80 }}>
        {/* Header banner — the one place it's OK to lean into the maroon +
            gold devotional identity a little more, since it's a single,
            calm block rather than scattered across the app. */}
        <View style={styles.banner}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <AppText variant="h1" style={{ color: theme.color.white }}>
                {initialsFor(session.customerId)}
              </AppText>
            </View>
          </View>
          <AppText variant="h3" style={{ color: theme.color.white, marginTop: theme.spacing.md }}>
            {t('meNamaste')}
          </AppText>
          <AppText variant="bodySmall" style={{ color: theme.color.accentLight, marginTop: 2 }}>
            {t('meCustomerId', { id: session.customerId || '\u2014' })}
          </AppText>
        </View>

        <View style={styles.body}>
          <Card style={styles.refCard}>
            <View style={styles.refRow}>
              <View style={styles.refIconWrap}>
                <Sparkles size={18} color={theme.color.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color="textSecondary">{t('meReferenceCode').toUpperCase()}</AppText>
                <AppText variant="h3">{session.custRefCode || '\u2014'}</AppText>
              </View>
            </View>
          </Card>

          <AppText variant="caption" color="textSecondary" style={styles.sectionLabel}>
            {t('meSettings').toUpperCase()}
          </AppText>
          <Card noPadding style={{ overflow: 'hidden', marginBottom: theme.spacing.xl }}>
            <MenuRow
              icon={Settings}
              label={t('meAppearance')}
              sublabel={`${t('language')} · ${t('settingsThemeColor')}`}
              onPress={() => navigation.navigate('Settings')}
              theme={theme}
            />
            <Divider theme={theme} />
            <MenuRow
              icon={Settings}
              label={t('meCalendarPreferences')}
              sublabel={t('meCalendarPreferencesSub')}
              onPress={() => navigation.navigate('Preferences')}
              theme={theme}
            />
            <Divider theme={theme} />
            <MenuRow
              icon={KeyRound}
              label={t('meChangePin')}
              sublabel={t('meChangePinSub')}
              onPress={() => navigation.navigate('SetPin')}
              theme={theme}
            />
          </Card>

          <AppText variant="caption" color="textSecondary" style={styles.sectionLabel}>
            GOOGLE CALENDAR
          </AppText>
          <GoogleCalendarCard theme={theme} />
          <AppText variant="caption" color="textSecondary" style={styles.sectionLabel}>
            {t('meSupport').toUpperCase()}
          </AppText>
          <Card noPadding style={{ overflow: 'hidden', marginBottom: theme.spacing.xl }}>
            <MenuRow icon={Phone} label={t('meContactSupport')} onPress={() => { }} theme={theme} />
            <Divider theme={theme} />
            <MenuRow icon={Mail} label={t('meSendFeedback')} onPress={() => { }} theme={theme} />
          </Card>

          <MenuRow
            icon={LogOut}
            label={t('logOut')}
            onPress={logout}
            theme={theme}
            destructive
            card
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Divider({ theme }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.color.border }} />;
}

function GoogleCalendarCard({ theme }) {
  const styles = getMeStyles(theme);
  const { t } = useTranslation();
  const { connected, account, connecting, error, connect, disconnect, isRequestReady } = useGoogleCalendar();

  if (connected) {
    return (
      <Card style={{ marginBottom: theme.spacing.xl }}>
        <View style={styles.gcalRow}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#E7F0EA' }]}>
            <CalendarCheck size={18} color={theme.color.success} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="body">{t('connected')}</AppText>
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {account || 'Syncing personal events to this account'}
            </AppText>
          </View>
        </View>
        <Button
          label={t('disconnect')}
          variant="secondary"
          onPress={disconnect}
          icon={<Unlink size={16} color={theme.color.primary} />}
          style={{ marginTop: theme.spacing.md }}
        />
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: theme.spacing.xl }}>
      <View style={styles.gcalRow}>
        <View style={styles.menuIconWrap}>
          <CalendarCheck size={18} color={theme.color.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="body">{t('notConnected')}</AppText>
          <AppText variant="caption" color="textSecondary">
            Personal events you add won't sync to Google Calendar until you connect.
          </AppText>
        </View>
      </View>
      {error ? (
        <AppText variant="caption" color="error" style={{ marginTop: theme.spacing.sm }}>
          {error}
        </AppText>
      ) : null}
      <Button
        label={connecting ? 'Connecting\u2026' : t('connectGoogleCalendar')}
        onPress={connect}
        loading={connecting}
        disabled={!isRequestReady}
        style={{ marginTop: theme.spacing.md }}
      />
      {!isRequestReady ? (
        <AppText variant="caption" color="textSecondary" style={{ marginTop: theme.spacing.sm }}>
          Google sign-in isn't configured yet — add your client IDs to .env (see SETUP.md).
        </AppText>
      ) : null}
    </Card>
  );
}

function MenuRow({ icon: Icon, label, sublabel, onPress, theme, destructive, card }) {
  const styles = getMeStyles(theme);
  const row = (
    <View style={styles.menuRow}>
      <View
        style={[
          styles.menuIconWrap,
          { backgroundColor: destructive ? '#F5E6E6' : theme.color.surfaceAlt },
        ]}
      >
        <Icon size={18} color={destructive ? theme.color.error : theme.color.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="body" color={destructive ? 'error' : 'text'}>
          {label}
        </AppText>
        {sublabel ? (
          <AppText variant="caption" color="textSecondary">
            {sublabel}
          </AppText>
        ) : null}
      </View>
      {!destructive && <ChevronRight size={18} color={theme.color.textDisabled} />}
    </View>
  );

  if (card) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" style={{ marginBottom: theme.spacing.xl }}>
        <Card>{row}</Card>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {row}
    </Pressable>
  );
}

const getMeStyles = (theme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    banner: {
      backgroundColor: theme.color.primary,
      alignItems: 'center',
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
      borderBottomLeftRadius: theme.radius.lg,
      borderBottomRightRadius: theme.radius.lg,
    },
    avatarRing: {
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 2,
      borderColor: theme.color.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarCircle: {
      width: 78,
      height: 78,
      borderRadius: 39,
      backgroundColor: theme.color.primaryDark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
      marginTop: -theme.spacing.lg,
    },
    refCard: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    refRow: { flexDirection: 'row', alignItems: 'center' },
    gcalRow: { flexDirection: 'row', alignItems: 'center' },
    refIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.color.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    sectionLabel: { marginBottom: theme.spacing.sm, marginLeft: theme.spacing.xs },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.base,
    },
    menuIconWrap: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
  });

// ---- Calendar stack wrappers ----

function CalendarHomeWrapper({ navigation }) {
  return (
    <CalendarScreen
      onAddEvent={(date) => navigation.navigate('AddEvent', { date: date?.toISOString() })}
      onOpenEvent={(event) => {
        if (event.type === 'festival') {
          navigation.navigate('FestivalDetail', { name: event.title });
          return;
        }
        if (event.type !== 'personal' && event.type !== 'reminder') return;
        navigation.navigate('AddEvent', { eventId: event.id });
      }}
      onOpenPreferences={() => navigation.navigate('Preferences')}
    />
  );
}

function AddEventWrapper({ navigation, route }) {
  const initialDate = route.params?.date ? new Date(route.params.date) : new Date();
  const eventId = route.params?.eventId || null;
  return (
    <AddEventScreen
      initialDate={initialDate}
      eventId={eventId}
      onSaved={() => navigation.goBack()}
      onDeleted={() => navigation.goBack()}
      onCancel={() => navigation.goBack()}
    />
  );
}

function PreferencesWrapper({ navigation }) {
  return <PreferencesScreen onDone={() => navigation.goBack()} />;
}

function SetPinWrapper({ navigation }) {
  return <SetPinScreen onDone={() => navigation.goBack()} onCancel={() => navigation.goBack()} />;
}

function FestivalDetailWrapper({ navigation, route }) {
  const name = route.params?.name;
  return <FestivalDetailScreen festivalName={name || ''} onBack={() => navigation.goBack()} />;
}

function SettingsWrapper({ navigation }) {
  return <SettingsScreen onClose={() => navigation.goBack()} />;
}

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarHome" component={CalendarHomeWrapper} />
      <Stack.Screen name="AddEvent" component={AddEventWrapper} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Preferences" component={PreferencesWrapper} options={{ presentation: 'modal' }} />
      <Stack.Screen name="FestivalDetail" component={FestivalDetailWrapper} />
    </Stack.Navigator>
  );
}

function MeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeHome" component={MeScreen} />
      <Stack.Screen name="Settings" component={SettingsWrapper} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Preferences" component={PreferencesWrapper} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SetPin" component={SetPinWrapper} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreHome" component={ExploreHomeScreen} />
      <Stack.Screen name="AllEvents" component={AllEventsScreen} />
      <Stack.Screen name="AddEventFromExplore" component={AddEventWrapper} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function Tabs() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.primary,
        tabBarInactiveTintColor: theme.color.textSecondary,
        // react-navigation's bottom-tabs already pads for the home
        // indicator / gesture bar via safe-area-context — no extra
        // insets needed here, just a fixed comfortable height.
        tabBarStyle: {
          backgroundColor: theme.color.surface,
          borderTopColor: theme.color.border,

          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,

          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: theme.fontFamily.medium, fontSize: 12 },
      }}
    >
      <Tab.Screen name="Calendar" component={CalendarStack} options={{ tabBarLabel: t('calendarTab'), tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }} />
      <Tab.Screen name="Explore" component={ExploreStack} options={{ tabBarLabel: t('exploreTab'), tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} />
      <Tab.Screen name="Me" component={MeStack} options={{ tabBarLabel: t('meTab'), tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}
