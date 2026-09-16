import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { FilterChip } from '../components/FilterChip';
import { OrbitBackground } from '../components/OrbitBackground';
import type { HomeStackParamList } from '../navigation/types';
import { fetchStartupFilterOptions } from '../services/api';
import {
  countActiveStartupFilters,
  defaultStartupFilters,
  type StartupFilters,
} from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<HomeStackParamList, 'StartupsFilter'>;

export function StartupsFilterScreen({ navigation, route }: Props) {
  const [draft, setDraft] = useState<StartupFilters>(route.params.filters);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    fetchStartupFilterOptions()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingOptions(false));
  }, []);

  function applyFilters() {
    navigation.navigate({
      name: 'Feed',
      params: { mode: 'startups', startupFilters: draft },
      merge: true,
    });
  }

  function clearFilters() {
    setDraft(defaultStartupFilters);
  }

  return (
    <View style={styles.root}>
      <OrbitBackground theme="rings" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <MaterialIcons name="arrow-back" size={22} color={colors.ink} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Filter startups</Text>
          <Text style={styles.subtitle}>
            {countActiveStartupFilters(draft)} active filter
            {countActiveStartupFilters(draft) === 1 ? '' : 's'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Search</Text>
          <TextInput
            value={draft.search}
            onChangeText={(search) => setDraft((current) => ({ ...current, search }))}
            placeholder="Name or description"
            placeholderTextColor={colors.label}
            style={styles.input}
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.label}>Hiring only</Text>
              <Text style={styles.helper}>Show startups with open roles</Text>
            </View>
            <Switch
              value={draft.hiringOnly}
              onValueChange={(hiringOnly) => setDraft((current) => ({ ...current, hiringOnly }))}
              trackColor={{ false: colors.border, true: colors.black }}
              thumbColor={colors.white}
            />
          </View>

          <Text style={styles.label}>Category</Text>
          {loadingOptions ? (
            <ActivityIndicator color={colors.ink} style={styles.loader} />
          ) : (
            <View style={styles.chips}>
              <FilterChip
                label="All categories"
                active={draft.category === null}
                onPress={() => setDraft((current) => ({ ...current, category: null }))}
              />
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  label={category}
                  active={draft.category === category}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      category: current.category === category ? null : category,
                    }))
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={clearFilters} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Clear all</Text>
          </Pressable>
          <Pressable onPress={applyFilters} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Apply filters</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 32,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: colors.label,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 16,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  loader: {
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
  },
});
