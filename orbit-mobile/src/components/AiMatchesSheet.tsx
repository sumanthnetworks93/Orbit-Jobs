import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RankedMatch } from '../hyd/match';
import type { MatchPrefs } from '../services/jobAlerts';
import type { Job } from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  prefs: MatchPrefs;
  matches: RankedMatch[];
  onClose: () => void;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  onOpenJob: (job: Job) => void;
};

export function AiMatchesSheet({ prefs, matches, onClose, onSubscribe, onUnsubscribe, onOpenJob }: Props) {
  return (
    <>
      <Pressable testID="ai-matches-dismiss" style={styles.scrim} onPress={onClose} />
      <View style={styles.sheet} testID="ai-matches-sheet">
        <Text style={styles.title}>AI job matches</Text>
        <Text style={styles.hint}>
          {prefs.role || prefs.area
            ? `Matching ${prefs.role || 'your profile'}${prefs.area ? ` in ${prefs.area}` : ''}.`
            : 'Save a voice resume or subscribe from a job so Orbit can match you.'}
        </Text>
        <Pressable
          testID="matches-subscribe"
          onPress={() => (prefs.subscribed ? onUnsubscribe() : onSubscribe())}
          style={[styles.subscribe, prefs.subscribed && styles.subscribeOn]}
        >
          <Text style={[styles.subscribeText, prefs.subscribed && styles.subscribeTextOn]}>
            {prefs.subscribed ? 'Subscribed to alerts' : 'Subscribe to AI match alerts'}
          </Text>
        </Pressable>
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {matches.length === 0 ? (
            <Text style={styles.empty}>No strong matches yet. Subscribe after you save a voice resume.</Text>
          ) : (
            matches.map((item) => (
              <Pressable
                key={item.job.id}
                testID={`ai-match-${item.job.id}`}
                onPress={() => onOpenJob(item.job)}
                style={styles.row}
              >
                <Text style={styles.score}>{item.score}%</Text>
                <View style={styles.copy}>
                  <Text style={styles.job}>{item.job.title}</Text>
                  <Text style={styles.meta}>
                    {item.job.company} · {item.job.area ?? item.job.location}
                  </Text>
                  <Text style={styles.why}>{item.reasons.join(' · ')}</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
        <Pressable testID="ai-matches-close" onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,20,15,0.18)',
    zIndex: 30,
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 72,
    maxHeight: '78%',
    zIndex: 31,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.ink },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 18 },
  subscribe: {
    marginTop: 12,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  subscribeOn: { backgroundColor: colors.black, borderColor: colors.black },
  subscribeText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  subscribeTextOn: { color: colors.white },
  list: { marginTop: 12, maxHeight: 360 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, paddingVertical: 12 },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  score: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink, width: 44, marginTop: 2 },
  copy: { flex: 1 },
  job: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  why: { fontFamily: fonts.regular, fontSize: 12, color: colors.label, marginTop: 4 },
  close: {
    marginTop: 10,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
  },
  closeText: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
});
