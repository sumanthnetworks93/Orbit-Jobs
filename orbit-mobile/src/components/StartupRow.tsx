import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Startup } from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  startup: Startup;
};

export const StartupRow = memo(function StartupRow({ startup }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: startup.color }]}>
        <Text style={styles.initial}>{startup.initial}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{startup.name}</Text>
        <Text style={styles.description}>{startup.description}</Text>
        <Text style={styles.meta}>
          {startup.category} · {startup.openRoles} open role{startup.openRoles === 1 ? '' : 's'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.ink,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.label,
  },
});
