import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AiMatchesSheet } from '../components/AiMatchesSheet';
import { ApplySheet } from '../components/ApplySheet';
import { JobRow } from '../components/JobRow';
import { TELANGANA_DISTRICTS } from '../hyd/areas';
import { dayKeyInIst, jobsFeedRows } from '../hyd/postedAt';
import { PostButton } from '../components/PostButton';
import { SocialFooter } from '../components/SocialFooter';
import { PostModal } from '../components/PostModal';
import { SegmentedControl } from '../components/SegmentedControl';
import { StartupRow } from '../components/StartupRow';
import type { HomeStackParamList } from '../navigation/types';
import { fetchGeoLocation, fetchJobs, fetchStartups } from '../services/api';
import { previewHydJobs } from '../hyd/previewJobs';
import { getPlatformControlsSync } from '../services/adminControl';
import {
  getMatchAlerts,
  markMatchesRead,
  subscribeToJobMatches,
  unsubscribeFromJobMatches,
  type MatchPrefs,
} from '../services/jobAlerts';
import type { RankedMatch } from '../hyd/match';
import {
  countActiveJobFilters,
  countActiveStartupFilters,
  defaultJobFilters,
  defaultStartupFilters,
  type GeoLocation,
  type Job,
  type JobFilters,
  type Startup,
  type StartupFilters,
} from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<HomeStackParamList, 'Feed'>;
type FeedMode = 'startups' | 'jobs';

export function HomeScreen({ navigation, route }: Props) {
  const mode: FeedMode = route.params?.mode ?? 'jobs';
  const startupFilterParams = route.params?.startupFilters;
  const jobFilterParams = route.params?.jobFilters;
  const startupFilters = useMemo(
    () => startupFilterParams ?? defaultStartupFilters,
    [
      startupFilterParams?.search,
      startupFilterParams?.category,
      startupFilterParams?.hiringOnly,
    ],
  );
  const jobFilters = useMemo(
    () => ({ ...defaultJobFilters, ...jobFilterParams }),
    [
      jobFilterParams?.search,
      jobFilterParams?.jobType,
      jobFilterParams?.location,
      jobFilterParams?.remoteOnly,
      jobFilterParams?.area,
      jobFilterParams?.womenSafe,
      jobFilterParams?.cabProvided,
      jobFilterParams?.nearMetro,
      jobFilterParams?.lateShift,
      jobFilterParams?.verifiedOnly,
      jobFilterParams?.walkInOnly,
    ],
  );

  const [startups, setStartups] = useState<Startup[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [startupPage, setStartupPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  const [startupTotal, setStartupTotal] = useState(0);
  const [jobMeta, setJobMeta] = useState({
    roleCount: 0,
    startupCount: 0,
    postedTodayCount: 0,
    postedByDay: [] as { date: string; count: number }[],
  });
  const [startupHasMore, setStartupHasMore] = useState(false);
  const [jobHasMore, setJobHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [geo, setGeo] = useState<GeoLocation | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [matchPrefs, setMatchPrefs] = useState<MatchPrefs | null>(null);
  const [matchList, setMatchList] = useState<RankedMatch[]>([]);
  const [unreadMatches, setUnreadMatches] = useState(0);

  const loadStartups = useCallback(async (pageNum: number, append: boolean, filters: StartupFilters) => {
    const data = await fetchStartups(pageNum, filters);
    setStartups((current) => (append ? [...current, ...data.items] : data.items));
    setStartupPage(data.page);
    setStartupTotal(data.totalCount);
    setStartupHasMore(data.page < data.totalPages);
  }, []);

  const jobsLoadId = useRef(0);

  const loadJobs = useCallback(async (
    pageNum: number,
    append: boolean,
    filters: JobFilters,
  ) => {
    const loadId = ++jobsLoadId.current;
    if (!append && pageNum === 1) {
      const preview = previewHydJobs(filters);
      setJobs(preview.jobs);
      setJobPage(preview.page);
      setJobMeta({
        roleCount: preview.totalCount,
        startupCount: preview.startupCount,
        postedTodayCount: preview.postedTodayCount,
        postedByDay: preview.postedByDay,
      });
      setJobHasMore(false);
    }

    const data = await fetchJobs(pageNum, filters);
    if (loadId !== jobsLoadId.current) return;
    setJobs((current) => (append ? [...current, ...data.jobs] : data.jobs));
    setJobPage(data.page);
    setJobMeta({
      roleCount: data.totalCount,
      startupCount: data.startupCount,
      postedTodayCount: data.postedTodayCount,
      postedByDay: data.postedByDay,
    });
    setJobHasMore(data.page < data.totalPages);
  }, []);

  const loadFeed = useCallback(async (
    activeMode: FeedMode,
    pageNum: number,
    append: boolean,
  ) => {
    try {
      setError(null);
      if (activeMode === 'startups') {
        await loadStartups(pageNum, append, startupFilters);
      } else {
        await loadJobs(pageNum, append, jobFilters);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed.');
      if (!append) {
        if (activeMode === 'startups') {
          setStartups([]);
          setStartupTotal(0);
          setStartupHasMore(false);
        } else {
          setJobs([]);
          setJobMeta({ roleCount: 0, startupCount: 0, postedTodayCount: 0, postedByDay: [] });
          setJobHasMore(false);
        }
      }
    }
  }, [jobFilters, loadJobs, loadStartups, startupFilters]);

  useEffect(() => {
    fetchGeoLocation()
      .then(setGeo)
      .catch(() => undefined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void getMatchAlerts()
        .then(({ prefs, matches, unread }) => {
          setMatchPrefs(prefs);
          setMatchList(matches);
          setUnreadMatches(unread);
        })
        .catch(() => undefined);
    }, []),
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadFeed(mode, 1, false).finally(() => {
      if (cancelled) return;
      setLoading(false);
      setRefreshing(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadFeed, mode, startupFilters, jobFilters]);

  function setMode(nextMode: FeedMode) {
    navigation.setParams({ mode: nextMode, startupFilters, jobFilters });
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadFeed(mode, 1, false);
    setRefreshing(false);
  }

  function renderListFooter(hasMore: boolean) {
    if (loadingMore) {
      return <ActivityIndicator color={colors.ink} style={styles.footerLoader} />;
    }

    if (!hasMore) {
      return null;
    }

    return (
      <Pressable
        style={({ pressed }) => [styles.loadMore, pressed && styles.pressed]}
        onPress={handleLoadMore}
      >
        <Text style={styles.loadMoreText}>Load more</Text>
      </Pressable>
    );
  }

  async function handleLoadMore() {
    if (loading || loadingMore || refreshing) return;

    const hasMore = mode === 'startups' ? startupHasMore : jobHasMore;
    if (!hasMore) return;

    setLoadingMore(true);
    const nextPage = mode === 'startups' ? startupPage + 1 : jobPage + 1;
    await loadFeed(mode, nextPage, true);
    setLoadingMore(false);
  }

  async function reloadFeed() {
    setLoading(true);
    await loadFeed(mode, 1, false);
    setLoading(false);
  }

  const activeFilterCount =
    mode === 'startups' ? countActiveStartupFilters(startupFilters) : countActiveJobFilters(jobFilters);

  const eyebrow = mode === 'startups' ? 'TRENDING TODAY' : 'TODAY';
  const title = mode === 'startups' ? 'Startups' : 'Jobs';
  const meta =
    mode === 'startups'
      ? `${startupTotal} LISTED`
      : `${jobMeta.postedTodayCount} POSTED TODAY · ${jobMeta.roleCount} ROLES`;
  const jobRows = useMemo(() => {
    const counts = Object.fromEntries(jobMeta.postedByDay.map((row) => [row.date, row.count]));
    return jobsFeedRows(jobs, counts);
  }, [jobs, jobMeta.postedByDay]);
  const todayKey = dayKeyInIst(Date.now());
  const locationLabel =
    jobFilters.area ||
    (jobFilters.location.trim() ? jobFilters.location.split(',')[0].trim() : null) ||
    geo?.city ||
    'Telangana';
  const allTelanganaSelected = !jobFilters.area && !jobFilters.location.trim();
  const myLocationValue = geo?.city
    ? [geo.city, geo.state || geo.country].filter(Boolean).join(', ')
    : '';

  function setJobLocation(area: string | null, location: string) {
    navigation.setParams({
      mode: 'jobs',
      jobFilters: { ...jobFilters, area, location },
    });
    setLocationOpen(false);
  }

  const openApply = useCallback((job: Job) => setApplyJob(job), []);
  const closeApply = useCallback(() => setApplyJob(null), []);
  const openJob = useCallback((job: Job) => {
    navigation.navigate('JobDetail', { job });
  }, [navigation]);
  const renderStartupItem = useCallback(({ item }: { item: Startup }) => (
    <StartupRow startup={item} />
  ), []);
  const renderJobItem = useCallback(({ item }: { item: (typeof jobRows)[number] }) => {
    if (item.kind === 'day') {
      return (
        <View
          testID={item.key === todayKey ? 'jobs-day-today' : `jobs-day-${item.key}`}
          style={styles.dayHead}
        >
          <Text style={styles.dayLabel}>{item.label}</Text>
          <Text style={styles.dayCount}>{item.count} posted</Text>
        </View>
      );
    }
    return <JobRow job={item.job} onApply={openApply} onOpen={openJob} />;
  }, [openApply, openJob, todayKey]);

  return (
    <View style={styles.root} testID={mode === 'jobs' ? 'jobs-screen' : 'startups-screen'}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.headerActions}>
            <Pressable
              testID="header-alerts"
              onPress={() => {
                setLocationOpen(false);
                setAlertsOpen(true);
                void markMatchesRead(matchList.map((item) => item.job.id)).then(() => setUnreadMatches(0));
              }}
              style={({ pressed }) => [styles.alertsBtn, pressed && styles.pressed]}
            >
              <MaterialIcons name="notifications-none" size={18} color={colors.ink} />
              {unreadMatches > 0 ? (
                <View style={styles.alertsDot} testID="header-alerts-count">
                  <Text style={styles.alertsDotText}>{unreadMatches}</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              testID="header-location"
              onPress={() => {
                setAlertsOpen(false);
                setLocationOpen(true);
              }}
              style={({ pressed }) => [styles.locationBtn, pressed && styles.pressed]}
            >
              <MaterialIcons name="location-on" size={16} color={colors.ink} />
              <Text style={styles.locationBtnText} numberOfLines={1}>
                {locationLabel}
              </Text>
              <MaterialIcons name="expand-more" size={16} color={colors.label} />
            </Pressable>
            </View>
          </View>
          <SegmentedControl value={mode} onChange={setMode} />
          <View style={styles.metaRow}>
            <Text style={styles.meta} testID="feed-meta">{meta}</Text>
            <View style={styles.metaActions}>
              <PostButton onPress={() => setPostOpen(true)} />
              <Pressable
                testID="open-filters"
                onPress={() => {
                  if (mode === 'startups') {
                    navigation.navigate('StartupsFilter', { filters: startupFilters });
                  } else {
                    navigation.navigate('JobsFilter', { filters: jobFilters });
                  }
                }}
                style={styles.filterLink}
              >
                <Text style={styles.filterText}>
                  Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {getPlatformControlsSync().maintenance ? (
          <View testID="maintenance-banner" style={styles.maintenance}>
            <Text style={styles.maintenanceText}>Orbit is in maintenance. Some actions may be paused.</Text>
          </View>
        ) : null}

        {loading && (mode === 'startups' ? startups.length === 0 : jobs.length === 0) ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.ink} />
          </View>
        ) : mode === 'startups' ? (
          <FlatList
            style={styles.listView}
            data={startups}
            keyExtractor={(item) => `startup-${item.id}`}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={10}
            maxToRenderPerBatch={8}
            windowSize={7}
            ListEmptyComponent={
              <Text style={styles.empty}>{error ?? 'No startups match these filters.'}</Text>
            }
            ListFooterComponent={renderListFooter(startupHasMore)}
            removeClippedSubviews={false}
            renderItem={renderStartupItem}
          />
        ) : (
          <FlatList
            style={styles.listView}
            data={jobRows}
            keyExtractor={(item) => (item.kind === 'day' ? `day-${item.key}` : `job-${item.job.id}`)}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={10}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={false}
            ListEmptyComponent={
              <Text style={styles.empty}>{error ?? 'No jobs match these filters.'}</Text>
            }
            ListFooterComponent={renderListFooter(jobHasMore)}
            renderItem={renderJobItem}
          />
        )}

        <SocialFooter />

        <ApplySheet job={applyJob} visible={applyJob !== null} onClose={closeApply} />

        {alertsOpen ? (
          <AiMatchesSheet
            prefs={matchPrefs ?? { role: '', area: '', subscribed: false, whatsapp: true, readIds: [] }}
            matches={matchList}
            onClose={() => setAlertsOpen(false)}
            onSubscribe={() =>
              void subscribeToJobMatches().then((prefs) =>
                getMatchAlerts().then(({ matches, unread }) => {
                  setMatchPrefs(prefs);
                  setMatchList(matches);
                  setUnreadMatches(unread);
                }),
              )
            }
            onUnsubscribe={() =>
              void unsubscribeFromJobMatches().then((prefs) => {
                setMatchPrefs(prefs);
                setUnreadMatches(0);
              })
            }
            onOpenJob={(job) => {
              setAlertsOpen(false);
              navigation.navigate('JobDetail', { job });
            }}
          />
        ) : null}

        {locationOpen ? (
          <>
            <Pressable
              testID="location-dismiss"
              style={styles.locationScrim}
              onPress={() => setLocationOpen(false)}
            />
            <View style={styles.locationMenu} testID="location-sheet">
              <Text style={styles.locationSheetTitle}>Location</Text>
              <Text style={styles.locationSheetHint}>All 33 Telangana districts</Text>
              <ScrollView style={styles.locationList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              <Pressable
                testID="location-all"
                onPress={() => setJobLocation(null, '')}
                style={[styles.locationChoice, allTelanganaSelected && styles.locationChoiceOn]}
              >
                <Text style={styles.locationChoiceText}>All Telangana</Text>
              </Pressable>
              {TELANGANA_DISTRICTS.map((district) => (
                <Pressable
                  key={district}
                  testID={`location-choice-${district}`}
                  onPress={() => setJobLocation(district, `${district}, Telangana`)}
                  style={[styles.locationChoice, jobFilters.area === district && styles.locationChoiceOn]}
                >
                  <Text style={styles.locationChoiceText}>{district}</Text>
                </Pressable>
              ))}
              {geo?.city ? (
                <Pressable
                  testID="location-mine"
                  onPress={() => setJobLocation(null, myLocationValue)}
                  style={[
                    styles.locationChoice,
                    !jobFilters.area && jobFilters.location === myLocationValue && styles.locationChoiceOn,
                  ]}
                >
                  <Text style={styles.locationChoiceText}>Use my location · {geo.city}</Text>
                </Pressable>
              ) : null}
              </ScrollView>
            </View>
          </>
        ) : null}

        <PostModal
          visible={postOpen}
          variant={mode === 'startups' ? 'startup' : 'job'}
          onClose={() => setPostOpen(false)}
          onPosted={reloadFeed}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.canvas,
    zIndex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  alertsBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertsDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  alertsDotText: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.white,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 158,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  locationBtnText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
  },
  locationScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,20,15,0.18)',
    zIndex: 20,
  },
  locationMenu: {
    position: 'absolute',
    top: 72,
    right: 16,
    width: 260,
    maxHeight: 420,
    zIndex: 21,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 10,
    shadowColor: '#16140F',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  locationList: {
    maxHeight: 340,
  },
  locationSheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: 4,
  },
  locationSheetHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  locationChoice: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 2,
    backgroundColor: '#FFFFFF',
  },
  locationChoiceOn: {
    backgroundColor: colors.canvas,
  },
  locationChoiceText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  eyebrow: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.label,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 34,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 12,
  },
  metaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listView: {
    flex: 1,
  },
  meta: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.label,
    flexShrink: 1,
  },
  dayHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  dayLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.ink,
  },
  dayCount: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  filterLink: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  filterText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
  },
  maintenance: {
    marginHorizontal: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  maintenanceText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
  },
  footerLoader: {
    marginVertical: 20,
  },
  loadMore: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  loadMoreText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.88,
  },
});
