import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AppliedScreen } from '../screens/AppliedScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { AdminHomeScreen } from '../screens/AdminHomeScreen';
import { AdminJobsScreen } from '../screens/AdminJobsScreen';
import { AdminPeopleScreen } from '../screens/AdminPeopleScreen';
import { AdminProfileScreen } from '../screens/AdminProfileScreen';
import { EmployerDashboardScreen } from '../screens/EmployerDashboardScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { WalkInsScreen } from '../screens/WalkInsScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { JobsFilterScreen } from '../screens/JobsFilterScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { StartupsFilterScreen } from '../screens/StartupsFilterScreen';
import type {
  AdminTabParamList,
  AppliedStackParamList,
  HomeStackParamList,
  MainTabParamList,
  RootStackParamList,
  WalkInsStackParamList,
} from './types';
import { useIsCompact } from '../hyd/useIsCompact';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const WalkInsStack = createNativeStackNavigator<WalkInsStackParamList>();
const AppliedStack = createNativeStackNavigator<AppliedStackParamList>();

function TabIcon({
  label,
  active,
  icon,
  iconActive,
}: {
  label: string;
  active: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconActive: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View style={[styles.tabItem, active && styles.tabItemActive]}>
      <View style={styles.tabIconBox}>
        <MaterialIcons
          name={active ? iconActive : icon}
          size={20}
          color={active ? colors.ink : colors.label}
        />
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Feed" component={HomeScreen} initialParams={{ mode: 'jobs' }} />
      <HomeStack.Screen name="StartupsFilter" component={StartupsFilterScreen} />
      <HomeStack.Screen name="JobsFilter" component={JobsFilterScreen} />
      <HomeStack.Screen name="JobDetail" component={JobDetailScreen} />
    </HomeStack.Navigator>
  );
}

function WalkInsNavigator() {
  return (
    <WalkInsStack.Navigator screenOptions={{ headerShown: false }}>
      <WalkInsStack.Screen name="WalkInsList" component={WalkInsScreen} />
      <WalkInsStack.Screen name="JobDetail" component={JobDetailScreen} />
    </WalkInsStack.Navigator>
  );
}

function AppliedNavigator() {
  return (
    <AppliedStack.Navigator screenOptions={{ headerShown: false }}>
      <AppliedStack.Screen name="AppliedList" component={AppliedScreen} />
      <AppliedStack.Screen name="JobDetail" component={JobDetailScreen} />
    </AppliedStack.Navigator>
  );
}

function MainTabs() {
  const compact = useIsCompact(600);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, compact && styles.tabBarCompact],
        tabBarButton: ({ href: _href, style, children, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            style={(state) => [
              typeof style === 'function' ? style(state) : style,
              styles.tabButton,
            ]}
          >
            {children}
          </Pressable>
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarButtonTestID: 'tab-home',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Home"
              active={focused}
              icon="home"
              iconActive="home"
            />
          ),
        }}
      />
      <Tab.Screen
        name="WalkIns"
        component={WalkInsNavigator}
        options={{
          tabBarButtonTestID: 'tab-walkins',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Walk-ins"
              active={focused}
              icon="event"
              iconActive="event"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Applied"
        component={AppliedNavigator}
        options={{
          tabBarButtonTestID: 'tab-applied',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Applied"
              active={focused}
              icon="check-box-outline-blank"
              iconActive="check-box"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarButtonTestID: 'tab-profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Profile"
              active={focused}
              icon="person-outline"
              iconActive="person"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  const compact = useIsCompact(600);
  return (
    <AdminTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, compact && styles.tabBarCompact],
        tabBarButton: ({ href: _href, style, children, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            style={(state) => [
              typeof style === 'function' ? style(state) : style,
              styles.tabButton,
            ]}
          >
            {children}
          </Pressable>
        ),
      }}
    >
      <AdminTab.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{
          tabBarButtonTestID: 'tab-admin-home',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Control" active={focused} icon="admin-panel-settings" iconActive="admin-panel-settings" />
          ),
        }}
      />
      <AdminTab.Screen
        name="AdminPeople"
        component={AdminPeopleScreen}
        options={{
          tabBarButtonTestID: 'tab-admin-people',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="People" active={focused} icon="people" iconActive="people" />
          ),
        }}
      />
      <AdminTab.Screen
        name="AdminJobs"
        component={AdminJobsScreen}
        options={{
          tabBarButtonTestID: 'tab-admin-jobs',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Jobs" active={focused} icon="work-outline" iconActive="work" />
          ),
        }}
      />
      <AdminTab.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{
          tabBarButtonTestID: 'tab-admin-profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Staff" active={focused} icon="person-outline" iconActive="person" />
          ),
        }}
      />
    </AdminTab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen
            name="Main"
            component={
              user.role === 'admin' ? AdminTabs : user.role === 'employer' ? EmployerDashboardScreen : MainTabs
            }
          />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  tabBar: {
    height: 64,
    maxHeight: 64,
    minHeight: 64,
    flexGrow: 0,
    flexShrink: 0,
    paddingTop: 4,
    paddingBottom: 6,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  tabBarCompact: {
    height: 60,
    maxHeight: 60,
    minHeight: 60,
    paddingTop: 2,
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 56,
    maxWidth: 88,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabItemActive: {
    backgroundColor: colors.canvas,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.label,
  },
  tabLabelActive: {
    color: colors.ink,
  },
});

export type { RootStackParamList, MainTabParamList } from './types';
