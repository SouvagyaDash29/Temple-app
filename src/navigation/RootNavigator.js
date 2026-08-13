// src/navigation/RootNavigator.js
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Screen from '../components/Screen';
import CalendarScreen from '../screens/CalendarScreen';
import AddEventScreen from '../screens/dump/AddEventScreen';
import PreferencesScreen from '../screens/dump/PreferencesScreen';
import { SetPinScreen } from '../screens/auth1';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ExploreScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <Placeholder label="Explore \u2014 temples, sevas & festivals coming soon" theme={theme} />
    </Screen>
  );
}

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
  const { session, logout } = useAuthContext();

  return (
    <Screen style={{ backgroundColor: theme.color.background }}>
      <View style={styles.scroll}>
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
            Namaste \ud83d\ude4f
          </AppText>
          <AppText variant="bodySmall" style={{ color: theme.color.accentLight, marginTop: 2 }}>
            Customer ID: {session.customerId || '\u2014'}
          </AppText>
        </View>

        <View style={styles.body}>
          <Card style={styles.refCard}>
            <View style={styles.refRow}>
              <View style={styles.refIconWrap}>
                <Sparkles size={18} color={theme.color.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color="textSecondary">REFERENCE CODE</AppText>
                <AppText variant="h3">{session.custRefCode || '\u2014'}</AppText>
              </View>
            </View>
          </Card>

          <AppText variant="caption" color="textSecondary" style={styles.sectionLabel}>
            SETTINGS
          </AppText>
          <Card noPadding style={{ overflow: 'hidden', marginBottom: theme.spacing.xl }}>
            <MenuRow
              icon={Settings}
              label="Calendar preferences"
              sublabel="State, panji & festival source"
              onPress={() => navigation.navigate('Preferences')}
              theme={theme}
            />
            <Divider theme={theme} />
            <MenuRow
              icon={KeyRound}
              label="Change PIN"
              sublabel="Update your login PIN"
              onPress={() => navigation.navigate('SetPin')}
              theme={theme}
            />
          </Card>

          <AppText variant="caption" color="textSecondary" style={styles.sectionLabel}>
            SUPPORT
          </AppText>
          <Card noPadding style={{ overflow: 'hidden', marginBottom: theme.spacing.xl }}>
            <MenuRow icon={Phone} label="Contact support" onPress={() => { }} theme={theme} />
            <Divider theme={theme} />
            <MenuRow icon={Mail} label="Send feedback" onPress={() => { }} theme={theme} />
          </Card>

          <MenuRow
            icon={LogOut}
            label="Log out"
            onPress={logout}
            theme={theme}
            destructive
            card
          />
        </View>
      </View>
    </Screen>
  );
}

function Divider({ theme }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.color.border }} />;
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

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarHome" component={CalendarHomeWrapper} />
      <Stack.Screen name="AddEvent" component={AddEventWrapper} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Preferences" component={PreferencesWrapper} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function MeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeHome" component={MeScreen} />
      <Stack.Screen name="Preferences" component={PreferencesWrapper} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SetPin" component={SetPinWrapper} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function Tabs() {
  const theme = useTheme();
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: theme.fontFamily.medium, fontSize: 12 },
      }}
    >
      <Tab.Screen name="Calendar" component={CalendarStack} options={{ tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} />
      <Tab.Screen name="Me" component={MeStack} options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
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
