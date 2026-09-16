import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Mode = 'startups' | 'jobs';

type Props = {
  value: Mode;
  onChange: (value: Mode) => void;
};

export function SegmentedControl({ value, onChange }: Props) {
  return (
    <View style={styles.track}>
      <Pressable
        testID="segment-startups"
        onPress={() => onChange('startups')}
        style={[styles.segment, value === 'startups' && styles.segmentActive]}
      >
        <Text style={[styles.label, value === 'startups' && styles.labelActive]}>Startups</Text>
      </Pressable>
      <Pressable
        testID="segment-jobs"
        onPress={() => onChange('jobs')}
        style={[styles.segment, value === 'jobs' && styles.segmentActive]}
      >
        <Text style={[styles.label, value === 'jobs' && styles.labelActive]}>Jobs</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    padding: 4,
    backgroundColor: colors.white,
    marginTop: 16,
  },
  segment: {
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: colors.black,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  labelActive: {
    color: colors.white,
  },
});
