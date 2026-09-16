import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const DEFAULT_MESSAGE =
  'Find Hyderabad jobs on Orbit. Apply without sharing your personal number.';

type SocialId = 'whatsapp' | 'instagram' | 'linkedin' | 'x';

type SocialLink = {
  id: SocialId;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  url: string;
};

function linksFor(message: string): SocialLink[] {
  const text = encodeURIComponent(message);
  return [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'whatsapp',
      color: '#25D366',
      url: `https://wa.me/?text=${text}`,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: 'instagram',
      color: '#E4405F',
      url: 'https://www.instagram.com/',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: 'linkedin',
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://orbit.app')}`,
    },
    {
      id: 'x',
      label: 'X',
      icon: 'twitter',
      color: colors.ink,
      url: `https://twitter.com/intent/tweet?text=${text}`,
    },
  ];
}

type Props = {
  message?: string;
};

export function SocialFooter({ message = DEFAULT_MESSAGE }: Props) {
  return (
    <View style={styles.bar} testID="social-footer">
      <Text style={styles.hint}>Share Orbit</Text>
      <View style={styles.row}>
        {linksFor(message).map((item) => (
          <Pressable
            key={item.id}
            testID={`social-${item.id}`}
            accessibilityLabel={item.label}
            onPress={() => {
              void Linking.openURL(item.url);
            }}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexGrow: 0,
    flexShrink: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.canvas,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  hint: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.label,
    textAlign: 'center',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    flexGrow: 0,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    flexGrow: 0,
    flexShrink: 0,
    gap: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.72,
  },
});
